#include <TinyGPS++.h>
#include <HardwareSerial.h>

// =====================================================
// BUSy Way - Smart Bus Tracking System
// ESP32 + NEO-6M GPS + Buzzer
// =====================================================

// ---------------- GPS ----------------
TinyGPSPlus gps;
HardwareSerial GPS(2);

#define GPS_RX 16   // ESP32 RX2 <- GPS TX
#define GPS_TX 17   // ESP32 TX2 -> GPS RX

// ---------------- BUZZER ----------------
#define BUZZER_PIN 25

// ---------------- SETTINGS ----------------
#define STOP_RADIUS 30.0
#define RESET_RADIUS 50.0

// =====================================================
// BUS STOPS
// Your original coordinates
// =====================================================

struct BusStop {
  const char* name;
  double latitude;
  double longitude;
};

// Stop coordinates converted from DMS to decimal
BusStop stops[] = {

  // Stop 1
  {
    "Stop 1",
    9.672833,
    77.965611
  },

  // Stop 2
  {
    "Stop 2",
    9.673528,
    77.965472
  },

  // Stop 3
  {
    "Stop 3",
    9.6734565,
    77.9644618
  }
};

const int TOTAL_STOPS = 3;

// =====================================================
// VARIABLES
// =====================================================

// Stores whether each stop has already triggered
bool stopTriggered[TOTAL_STOPS] = {
  false,
  false,
  false
};

// Current stop
int currentStop = -1;

// Last detected stop
int lastStop = -1;

// =====================================================
// BUZZER ALERT
// =====================================================

void buzzerAlert() {

  Serial.println();
  Serial.println("******************************");
  Serial.println("       BUZZER ALERT");
  Serial.println("******************************");

  for (int i = 0; i < 3; i++) {

    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);

    digitalWrite(BUZZER_PIN, LOW);
    delay(300);
  }
}

// =====================================================
// CALCULATE DISTANCE
// =====================================================

double getDistance(
  double currentLat,
  double currentLon,
  double stopLat,
  double stopLon
) {

  return TinyGPSPlus::distanceBetween(
    currentLat,
    currentLon,
    stopLat,
    stopLon
  );
}

// =====================================================
// FIND NEXT STOP
// =====================================================

void showNextStop(int reachedStop) {

  if (reachedStop < TOTAL_STOPS - 1) {

    Serial.print("Next Stop: ");
    Serial.println(stops[reachedStop + 1].name);

  } else {

    Serial.println("Next Stop: Route Completed");
  }
}

// =====================================================
// CHECK ALL STOPS
// =====================================================

void checkStops(double busLat, double busLon) {

  for (int i = 0; i < TOTAL_STOPS; i++) {

    double distance = getDistance(
      busLat,
      busLon,
      stops[i].latitude,
      stops[i].longitude
    );

    Serial.print(stops[i].name);
    Serial.print(" Distance: ");
    Serial.print(distance, 1);
    Serial.println(" m");


    // ==========================================
    // BUS HAS REACHED THE STOP
    // ==========================================

    if (distance <= STOP_RADIUS) {

      currentStop = i;

      // Trigger only once
      if (!stopTriggered[i]) {

        Serial.println();
        Serial.println("================================");
        Serial.print(" BUS REACHED: ");
        Serial.println(stops[i].name);
        Serial.println("================================");

        Serial.print("Bus Number: BUS-01");
        Serial.println();

        Serial.print("Latitude: ");
        Serial.println(busLat, 6);

        Serial.print("Longitude: ");
        Serial.println(busLon, 6);

        Serial.print("Distance from Stop: ");
        Serial.print(distance, 1);
        Serial.println(" m");

        // Buzzer
        buzzerAlert();

        // Notification message
        Serial.println();
        Serial.println("NOTIFICATION");
        Serial.print("BUS-01 has reached ");
        Serial.println(stops[i].name);

        // Show next stop
        showNextStop(i);

        Serial.println("================================");
        Serial.println();

        // Mark stop as triggered
        stopTriggered[i] = true;

        lastStop = i;
      }
    }

    // ==========================================
    // BUS HAS MOVED AWAY
    // ==========================================

    else if (distance > RESET_RADIUS) {

      stopTriggered[i] = false;
    }
  }
}

// =====================================================
// DISPLAY GPS INFORMATION
// =====================================================

void displayGPS() {

  double latitude = gps.location.lat();
  double longitude = gps.location.lng();

  Serial.println();
  Serial.println("--------------------------------");

  Serial.print("Bus Latitude : ");
  Serial.println(latitude, 6);

  Serial.print("Bus Longitude: ");
  Serial.println(longitude, 6);

  if (gps.speed.isValid()) {

    Serial.print("Speed        : ");
    Serial.print(gps.speed.kmph());
    Serial.println(" km/h");
  }

  if (gps.satellites.isValid()) {

    Serial.print("Satellites   : ");
    Serial.println(gps.satellites.value());
  }

  Serial.println("--------------------------------");

  // Check stops
  checkStops(latitude, longitude);
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  // Start GPS
  GPS.begin(
    9600,
    SERIAL_8N1,
    GPS_RX,
    GPS_TX
  );

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);


  // Startup message
  Serial.println();
  Serial.println("==========================================");
  Serial.println("       BUSy Way Smart Bus System");
  Serial.println("==========================================");

  Serial.println("ESP32 Started");
  Serial.println("GPS Started");
  Serial.println("Buzzer Started");

  Serial.println();
  Serial.println("Configured Bus Stops:");
  Serial.println("1. Stop 1");
  Serial.println("2. Stop 2");
  Serial.println("3. Stop 3");

  Serial.println();
  Serial.print("Stop Detection Radius: ");
  Serial.print(STOP_RADIUS);
  Serial.println(" meters");

  Serial.println();
  Serial.println("Waiting for GPS fix...");
  Serial.println("Take the GPS module to an open area.");
  Serial.println();
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  // Read all available GPS data
  while (GPS.available()) {

    gps.encode(GPS.read());
  }


  // Check GPS location
  if (gps.location.isValid()) {

    displayGPS();

    delay(2000);
  }

  else {

    Serial.println("Waiting for GPS location...");

    delay(1000);
  }
}