#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// =====================================================
// BUSy Way — Smart Bus Tracking System
// ESP32 + NEO-6M GPS + Backend Integration + Buzzer
// =====================================================
//
// This firmware:
//   1. Connects to Wi-Fi
//   2. Reads GPS coordinates from the NEO-6M module
//   3. POSTs location data to the BUSy Way backend
//   4. Parses the JSON response for arrival events
//   5. Beeps the buzzer ONLY when the backend confirms
//      a new stop arrival (server-authoritative detection)
//
// The local stop list is kept only for serial debug display.
// All real arrival logic runs on the backend's hysteresis
// state machine (30 m arrival, 45 m exit radius).
// =====================================================

// ======================== CONFIG ========================
// >>> CHANGE THESE BEFORE UPLOADING <<<

// Wi-Fi credentials
const char* WIFI_SSID     = "BUSyWay-Mobile";
const char* WIFI_PASSWORD  = "busywaywayway";

// Backend API endpoint — use your Render URL or localhost
// Examples:
//   Local:  "http://192.168.1.100:5000/api/location"
//   Render: "https://busyway-api.onrender.com/api/location"
const char* BACKEND_URL = "https://busyway-ifk2.onrender.com/";

// Bus ID from MongoDB — get it from GET /api/buses
// Example: "6700abcd1234ef5678901234"
const char* BUS_ID = "700abcd1234ef5678901234";

// How often to send GPS data (milliseconds)
const unsigned long SEND_INTERVAL_MS = 5000;

// Wi-Fi reconnection timeout (milliseconds)
const unsigned long WIFI_TIMEOUT_MS = 15000;

// ======================== PINS ==========================

#define GPS_RX     16    // ESP32 RX2 <- GPS TX
#define GPS_TX     17    // ESP32 TX2 -> GPS RX
#define BUZZER_PIN 25    // Active/passive buzzer
#define LED_PIN     2    // Built-in LED for status

// ======================== GPS ===========================

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// ======================== TIMING ========================

unsigned long lastSendTime    = 0;
unsigned long lastGpsReport   = 0;
bool          wifiConnected   = false;
int           sendFailCount   = 0;
const int     MAX_FAIL_BEFORE_RECONNECT = 5;

// ======================== STATS =========================

unsigned long totalPingsSent   = 0;
unsigned long totalPingsOk     = 0;
unsigned long totalPingsFailed = 0;
unsigned long totalArrivals    = 0;

// =====================================================
// BUZZER — three short beeps (server-confirmed arrival)
// =====================================================

void buzzerAlert() {
  Serial.println();
  Serial.println(F("****** BUZZER ALERT — STOP ARRIVAL CONFIRMED ******"));

  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(400);
    digitalWrite(BUZZER_PIN, LOW);
    delay(250);
  }

  // Explicitly ensure buzzer is off after alert
  digitalWrite(BUZZER_PIN, LOW);
}

// =====================================================
// STATUS LED PATTERNS
// =====================================================

void ledBlink(int count, int onMs, int offMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(onMs);
    digitalWrite(LED_PIN, LOW);
    delay(offMs);
  }
}

// =====================================================
// WI-FI CONNECTION
// =====================================================

bool connectWifi() {
  Serial.println();
  Serial.print(F("[WiFi] Connecting to "));
  Serial.print(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();

  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startAttempt > WIFI_TIMEOUT_MS) {
      Serial.println(F("\n[WiFi] Connection FAILED — timeout"));
      ledBlink(5, 100, 100);  // Fast blink = error
      return false;
    }
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.print(F("[WiFi] Connected! IP: "));
  Serial.println(WiFi.localIP());

  // Solid LED for 1 second = connected
  ledBlink(1, 1000, 0);

  return true;
}

void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    return;
  }

  wifiConnected = false;
  Serial.println(F("[WiFi] Disconnected — attempting reconnection..."));
  wifiConnected = connectWifi();
}

// =====================================================
// EXTRACT arrivalEvent FROM JSON RESPONSE
// =====================================================
// Lightweight parser — avoids pulling in ArduinoJson.
// Looks for "arrivalEvent":null  vs  "arrivalEvent":{...}
// If an arrival is found, extracts the "message" field.

bool parseArrivalEvent(const String& json, String& message) {
  // Check if arrivalEvent is null or missing
  int idx = json.indexOf("\"arrivalEvent\"");
  if (idx < 0) return false;

  // Skip past "arrivalEvent":
  idx = json.indexOf(':', idx);
  if (idx < 0) return false;
  idx++;

  // Skip whitespace
  while (idx < (int)json.length() && (json[idx] == ' ' || json[idx] == '\t')) idx++;

  // null means no arrival
  if (json.substring(idx, idx + 4) == "null") return false;

  // Look for "message":"..."
  int msgKey = json.indexOf("\"message\"", idx);
  if (msgKey < 0) return false;

  int colon = json.indexOf(':', msgKey);
  if (colon < 0) return false;

  int quoteStart = json.indexOf('"', colon + 1);
  if (quoteStart < 0) return false;

  int quoteEnd = json.indexOf('"', quoteStart + 1);
  if (quoteEnd < 0) return false;

  message = json.substring(quoteStart + 1, quoteEnd);
  return true;
}

// =====================================================
// SEND GPS DATA TO BACKEND
// =====================================================

void sendLocationToBackend(double lat, double lng, double speedKmh, int sats) {
  if (!wifiConnected) {
    Serial.println(F("[HTTP] Skipping — Wi-Fi not connected"));
    return;
  }

  totalPingsSent++;
  Serial.println();
  Serial.println(F("─── Sending GPS Ping ───"));
  Serial.print(F("  Lat: ")); Serial.println(lat, 6);
  Serial.print(F("  Lng: ")); Serial.println(lng, 6);
  Serial.print(F("  Speed: ")); Serial.print(speedKmh, 1); Serial.println(F(" km/h"));
  Serial.print(F("  Sats: ")); Serial.println(sats);

  // Build JSON body
  String body = "{\"busId\":\"";
  body += BUS_ID;
  body += "\",\"latitude\":";
  body += String(lat, 6);
  body += ",\"longitude\":";
  body += String(lng, 6);
  body += ",\"speed\":";
  body += String(speedKmh, 1);
  body += ",\"satellites\":";
  body += String(sats);
  body += "}";

  // Determine HTTP vs HTTPS
  bool isHttps = String(BACKEND_URL).startsWith("https");

  HTTPClient http;

  if (isHttps) {
    WiFiClientSecure* secureClient = new WiFiClientSecure();
    // For first deployment / demo — skip certificate verification.
    // For production, replace with: secureClient->setCACert(caCert);
    secureClient->setInsecure();
    http.begin(*secureClient, BACKEND_URL);
  } else {
    http.begin(BACKEND_URL);
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);  // 10 second timeout

  int httpCode = http.POST(body);

  if (httpCode > 0) {
    String response = http.getString();

    Serial.print(F("  HTTP "));
    Serial.print(httpCode);

    if (httpCode == 201) {
      // Location was stored
      totalPingsOk++;
      sendFailCount = 0;
      Serial.println(F(" — Location saved ✓"));

      // Check for arrival event
      String arrivalMessage;
      if (parseArrivalEvent(response, arrivalMessage)) {
        totalArrivals++;
        Serial.println();
        Serial.println(F("╔══════════════════════════════════════╗"));
        Serial.print(F("║  ARRIVAL: "));
        Serial.println(arrivalMessage);
        Serial.println(F("╚══════════════════════════════════════╝"));

        // Server confirmed a new stop arrival — beep!
        buzzerAlert();
      }

    } else if (httpCode == 202) {
      // Demo mode active — ping acknowledged but not stored
      Serial.println(F(" — Demo mode active (ping ignored)"));
      sendFailCount = 0;

    } else {
      // Other status codes
      totalPingsFailed++;
      sendFailCount++;
      Serial.print(F(" — Unexpected response: "));
      Serial.println(response.substring(0, 200));
    }

  } else {
    totalPingsFailed++;
    sendFailCount++;
    Serial.print(F("  HTTP Error: "));
    Serial.println(http.errorToString(httpCode));
  }

  http.end();

  // If too many consecutive failures, try reconnecting Wi-Fi
  if (sendFailCount >= MAX_FAIL_BEFORE_RECONNECT) {
    Serial.println(F("[HTTP] Too many failures — reconnecting Wi-Fi..."));
    WiFi.disconnect();
    delay(1000);
    ensureWifi();
    sendFailCount = 0;
  }
}

// =====================================================
// SERIAL STATUS DISPLAY
// =====================================================

void printGpsStatus() {
  double lat = gps.location.lat();
  double lng = gps.location.lng();

  Serial.println();
  Serial.println(F("──────── GPS Status ────────"));
  Serial.print(F("  Latitude : ")); Serial.println(lat, 6);
  Serial.print(F("  Longitude: ")); Serial.println(lng, 6);

  if (gps.speed.isValid()) {
    Serial.print(F("  Speed    : "));
    Serial.print(gps.speed.kmph(), 1);
    Serial.println(F(" km/h"));
  }

  if (gps.satellites.isValid()) {
    Serial.print(F("  Satellites: "));
    Serial.println(gps.satellites.value());
  }

  if (gps.hdop.isValid()) {
    Serial.print(F("  HDOP     : "));
    Serial.println(gps.hdop.hdop(), 1);
  }

  Serial.print(F("  WiFi     : "));
  Serial.println(wifiConnected ? "Connected" : "Disconnected");

  Serial.print(F("  Pings    : "));
  Serial.print(totalPingsOk);
  Serial.print(F(" OK / "));
  Serial.print(totalPingsFailed);
  Serial.print(F(" fail / "));
  Serial.print(totalPingsSent);
  Serial.println(F(" total"));

  Serial.print(F("  Arrivals : "));
  Serial.println(totalArrivals);

  Serial.println(F("────────────────────────────"));
}

// =====================================================
// SETUP
// =====================================================

void setup() {
  // Serial monitor
  Serial.begin(115200);
  delay(100);

  Serial.println();
  Serial.println(F("══════════════════════════════════════════"));
  Serial.println(F("     BUSy Way — Smart Bus Tracker"));
  Serial.println(F("   ESP32 + NEO-6M GPS + Wi-Fi Client"));
  Serial.println(F("══════════════════════════════════════════"));

  // Pin setup
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // GPS UART — 9600 baud on Serial2 (GPIO 16 RX, GPIO 17 TX)
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println(F("[GPS]   UART started (9600 baud, RX=16, TX=17)"));

  // Wi-Fi
  wifiConnected = connectWifi();

  // Config summary
  Serial.println();
  Serial.println(F("─── Configuration ───"));
  Serial.print(F("  Backend : ")); Serial.println(BACKEND_URL);
  Serial.print(F("  Bus ID  : ")); Serial.println(BUS_ID);
  Serial.print(F("  Interval: ")); Serial.print(SEND_INTERVAL_MS / 1000); Serial.println(F("s"));
  Serial.print(F("  WiFi    : ")); Serial.println(wifiConnected ? "Connected" : "Not connected");
  Serial.println();
  Serial.println(F("Waiting for GPS fix..."));
  Serial.println(F("(Take the module to an open area for best reception)"));
  Serial.println();

  // Startup beep — single short beep to confirm boot
  digitalWrite(BUZZER_PIN, HIGH);
  delay(150);
  digitalWrite(BUZZER_PIN, LOW);
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  // ── 1. Feed GPS parser ──
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  // ── 2. Process valid GPS fix ──
  if (gps.location.isValid() && gps.location.isUpdated()) {
    unsigned long now = millis();

    // Print GPS status every 10 seconds
    if (now - lastGpsReport >= 10000) {
      printGpsStatus();
      lastGpsReport = now;
    }

    // Send to backend at configured interval
    if (now - lastSendTime >= SEND_INTERVAL_MS) {
      // Ensure Wi-Fi is alive
      ensureWifi();

      double lat  = gps.location.lat();
      double lng  = gps.location.lng();
      double spd  = gps.speed.isValid() ? gps.speed.kmph() : 0.0;
      int    sats = gps.satellites.isValid() ? gps.satellites.value() : 0;

      sendLocationToBackend(lat, lng, spd, sats);

      // Brief LED flash on each ping
      ledBlink(1, 50, 0);

      lastSendTime = now;
    }

  } else {
    // No GPS fix yet — print waiting message every 3 seconds
    unsigned long now = millis();
    if (now - lastGpsReport >= 3000) {
      Serial.print(F("[GPS] Waiting for fix... chars processed: "));
      Serial.print(gps.charsProcessed());

      if (gps.charsProcessed() < 10) {
        Serial.println(F("  ⚠ Check wiring! No data from GPS module."));
      } else {
        Serial.print(F("  sentences OK: "));
        Serial.print(gps.sentencesWithFix());
        Serial.print(F("  failed: "));
        Serial.println(gps.failedChecksum());
      }

      lastGpsReport = now;
    }
  }
}
