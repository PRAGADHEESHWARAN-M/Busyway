# 🚌 BUSy Way — Smart Bus Tracking System

A full-stack, low-cost smart bus tracking system built for college / public transportation.

**Pipeline:** `NEO-6M GPS → ESP32 → Internet → Node.js/Express Backend → MongoDB → Web Application`

Built with React + Vite + Tailwind CSS on the frontend and Node.js + Express + MongoDB (Mongoose) on the backend, with JWT authentication, role-based access control, and a built-in **Demo/Simulation Mode** so the project can be presented even without the physical GPS hardware on hand.

---

## 1. Project Architecture

```
   NEO-6M GPS  →  ESP32  →  Internet (Wi-Fi)  →  BUSy Way Backend (Express/MongoDB)
                                                          │
                                                          ▼
                                          React Frontend (Student + Admin)
```

- The **ESP32** reads latitude/longitude (and speed/satellite count) from the NEO-6M GPS module and `POST`s it to `/api/location` every few seconds.
- The **backend** stores every ping in MongoDB (`BusLocation` collection) and calculates distance/ETA/route progress on read.
- The **frontend** polls the backend every 4–6 seconds to refresh the passenger and admin dashboards — no manual refresh needed.
- **Demo Mode** simulates GPS pings through the same code path as real hardware, so admins can demonstrate the system live even without a working GPS unit on site.

---

## 2. Project Structure

```
/busyway
  /backend
    /config        → MongoDB connection
    /controllers   → business logic for auth, buses, routes, stops, admin, demo mode
    /middleware    → JWT auth, role authorization, error handling
    /models        → Mongoose schemas (Admin, Student, Bus, Route, Stop, BusLocation)
    /routes        → Express route definitions
    /services      → ETA/distance math, demo-mode simulation engine
    /utils         → JWT token helper
    seed.js        → seeds demo admin/student/bus/route/stops
    server.js      → app entry point
    package.json
    .env.example
  /frontend
    /src
      /components  → Navbar, Footer, BusMap, RouteTimeline, StatCard, StatusBadge, etc.
      /pages       → Landing, Student & Admin pages
      /layouts     → StudentLayout, AdminLayout (sidebar navigation)
      /services    → axios instance (api.js)
      /hooks       → useInterval (polling), useAuth
      /utils       → time/distance formatting
      /context     → AuthContext (JWT + role storage)
    package.json
    .env.example
  README.md   ← you are here
```

---

## 3. Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (see Section 4)

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your MongoDB Atlas connection string + a JWT secret
npm run seed     # creates demo admin, student, bus, route and stops
npm run dev      # starts the API on http://localhost:5000
```

### 3.2 Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env should contain: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev      # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser. Use the demo credentials in Section 9 to log in.

---

## 4. MongoDB Atlas Setup

1. Create a free account at https://www.mongodb.com/cloud/atlas/register.
2. Create a new **Project** → **Build a Database** → choose the free **M0** tier.
3. Under **Database Access**, create a database user with a username/password (avoid special characters that need URL-encoding, or encode them).
4. Under **Network Access**, add your current IP, or `0.0.0.0/0` for development/demo purposes (not recommended for production).
5. Click **Connect → Drivers**, copy the connection string, and paste it into `backend/.env` as `MONGODB_URI`, replacing `<username>`, `<password>` and adding a database name, e.g.:
   ```
   MONGODB_URI=mongodb+srv://busyway_user:yourpassword@cluster0.xxxxx.mongodb.net/busyway?retryWrites=true&w=majority&appName=Cluster0
   ```
   (`MONGO_URI` is still accepted as a legacy alias — the code reads `MONGODB_URI` first.)

---

## 5. Environment Variables

### backend/.env
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (`MONGO_URI` also accepted as a fallback) |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_ORIGIN` | Comma-separated list of allowed frontend origins for CORS |
| `OFFLINE_THRESHOLD_SECONDS` | Seconds without a GPS ping before a bus is shown as OFFLINE |

### frontend/.env
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

**Never commit your `.env` files** — both are already listed in `.gitignore`.

---

## 6. Deployment

### 6.1 Backend → Render

1. Push the `backend` folder to a GitHub repository (or the whole monorepo).
2. On [Render](https://render.com), create a **New Web Service**, connect your repo, and set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add the environment variables from Section 5 in Render's **Environment** tab (use your real `MONGODB_URI`, a strong `JWT_SECRET`, and set `CLIENT_ORIGIN` to your deployed Netlify URL).
4. Deploy. Render will give you a URL like `https://busyway-api.onrender.com`.
5. Run the seed script once via Render's **Shell** tab: `npm run seed`.

### 6.2 Frontend → Netlify

1. Push the `frontend` folder to GitHub.
2. On [Netlify](https://netlify.com), create a **New site from Git**, and set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Add the environment variable `VITE_API_BASE_URL` pointing at your Render backend, e.g. `https://busyway-api.onrender.com/api`.
4. Deploy. Netlify will give you a URL like `https://busyway.netlify.app`.
5. Update the backend's `CLIENT_ORIGIN` env var on Render to match this Netlify URL, then redeploy the backend.

---

## 7. ESP32 API Integration

The ESP32 (with the NEO-6M GPS module wired to it) should send an HTTP POST request to:

```
POST https://<your-backend-url>/api/location
Content-Type: application/json

{
  "busId": "<Mongo ObjectId of the bus, from /api/buses>",
  "latitude": 9.672833,
  "longitude": 77.965611,
  "speed": 20,
  "satellites": 8,
  "timestamp": "2026-09-19T10:00:00Z"
}
```

**Arduino/ESP32 pseudocode:**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

void sendLocation(float lat, float lng, float speedKmh, int sats) {
  HTTPClient http;
  http.begin("https://<your-backend-url>/api/location");
  http.addHeader("Content-Type", "application/json");

  String body = String("{\"busId\":\"") + BUS_ID + "\",\"latitude\":" + lat +
                ",\"longitude\":" + lng + ",\"speed\":" + speedKmh +
                ",\"satellites\":" + sats + "}";

  int code = http.POST(body);
  http.end();
}
```

**Notes for production hardening:**
- The `busId` is fetched once from `GET /api/buses` (find the bus by `busNumber`) and hard-coded into the firmware.
- For a real deployment, add a shared device API key header (e.g. `x-device-key`) checked in `locationController.js` before accepting pings — this starter project keeps the endpoint open for simplicity in a classroom/demo setting.
- If the bus is currently in **Demo Mode**, real GPS pings are safely ignored by the backend (HTTP 202) rather than fighting with simulated data.

---

## 8. Demo / Simulation Mode

Because the physical GPS module may not always be available during a live demonstration, BUSy Way includes a built-in simulator:

1. Log in as **Admin** → go to **Live Tracking**.
2. Click **Start Demo** — the backend begins writing simulated GPS points (interpolated between the route's stops) into the same `BusLocation` collection real GPS data uses, tagged `source: "demo"`.
3. The passenger dashboard and map pick this up automatically through normal polling and clearly display **"DEMO MODE – SIMULATED GPS"** — it is never presented as real GPS data.
4. Admin controls: **Start Demo**, **Pause**, **Resume**, **Reset Demo**, **Next Stop** (jumps straight to the next stop instead of waiting for the interpolation).

---

## 9. Default Demo Credentials

After running `npm run seed` in `/backend`:

| Role | Identifier | Password |
|---|---|---|
| Admin | `admin@busyway.com` | `Admin@123` |
| Student | Roll No. `CSE2023001` or email `student@busyway.com` | `Student@123` |

**Change these before any real deployment.** Passwords are stored as bcrypt hashes in MongoDB — never in frontend code.

Seed data also creates:
- Bus `BUS-01` ("BUSy Way Express")
- One route ("Route 1 - City to College") with 10 stops using the coordinates supplied for this deployment.

---

## 10. API Documentation

All responses are JSON: `{ success: boolean, ...data }` on success, `{ success: false, message }` on error.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/student/signup` | Public | Register a new student |
| POST | `/api/auth/student/login` | Public | `{ identifier, password }` — identifier = roll number or email |
| POST | `/api/auth/admin/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Protected | Returns the logged-in user |

### Public data
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/buses` | List all buses |
| GET | `/api/buses/:id` | Single bus + its route |
| GET | `/api/buses/:id/location` | Full live status bundle: location, current/next stop, ETA, distance, live/offline/demo state |
| GET | `/api/routes` | List all routes |
| GET | `/api/routes/:id` | Route + its ordered stops |
| GET | `/api/stops?route=<id>` | Stops (optionally filtered by route) |

### ESP32 ingestion
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/location` | `{ busId, latitude, longitude, speed, satellites, timestamp }` |

### Admin (JWT + role=admin required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Summary stats |
| POST/PUT/DELETE | `/api/admin/buses[/:id]` | Bus CRUD |
| POST/PUT/DELETE | `/api/admin/routes[/:id]` | Route CRUD |
| POST/PUT/DELETE | `/api/admin/stops[/:id]` | Stop CRUD |
| PUT | `/api/admin/stops/reorder` | `{ stops: [{id, order}] }` |
| GET/DELETE | `/api/admin/students[/:id]` | List / remove students |
| POST | `/api/admin/demo/:busId/start` \| `pause` \| `resume` \| `reset` \| `next-stop` | Demo mode controls |

---

## 11. Security Notes

- Passwords hashed with bcrypt; never stored or sent in plain text.
- JWT-based auth with role embedded in the token; `protect` + `authorize('admin')` middleware guard every admin route.
- Students cannot create/edit/delete buses, routes, or stops — only admins can.
- MongoDB credentials only ever live in backend `.env` files, never in frontend code or Git history.
- Errors are sanitized before reaching the client — raw stack traces and DB errors are never exposed.

---

## 12. Troubleshooting

| Problem | Likely Cause / Fix |
|---|---|
| Frontend shows "Cannot reach the BUSy Way server" | Backend isn't running, or `VITE_API_BASE_URL` in `frontend/.env` is wrong |
| `MongoDB connection error` on backend start | Check `MONGODB_URI`, database user password, and that your IP is allow-listed in Atlas Network Access |
| Login fails with correct credentials | Make sure you ran `npm run seed`, and that you're using the right login form (student vs admin) |
| Bus always shows OFFLINE | No GPS/demo ping has been received recently; try Demo Mode, or check the ESP32 is reaching `/api/location` |
| CORS errors in browser console | Set `CLIENT_ORIGIN` in backend `.env` to your exact frontend URL (no trailing slash) and restart the backend |
| Map doesn't render | Check that `leaflet/dist/leaflet.css` is imported in `main.jsx` (it is, by default) and that stops have valid lat/lng |
| "Invalid GPS coordinates" from `/api/location` | Latitude must be -90..90 and longitude -180..180, and both must be numbers, not strings |

---

## 13. Future Enhancements

- Real-time push updates via **Socket.IO** instead of polling (the backend is already structured to support this).
- ML-based ETA prediction using historical traffic/speed data (explicitly *not* implemented yet — current ETA is a straightforward distance ÷ speed calculation).
- Multi-bus, multi-route fleet dashboard (the database schema already supports many buses/routes; the current seed data just uses one of each).
- Push notifications when the bus is a few minutes away.

---

Built as a final-year academic project. Code is commented throughout for readability.

---

## 14. BUS-01 stop-arrival detection

BUS-01 uses this ordered route. These coordinates are stored by `backend/seed.js` and must not be changed:

| Stop | Latitude | Longitude |
|---|---:|---:|
| Stop 1 | 9.672833 | 77.965611 |
| Stop 2 | 9.673528 | 77.965472 |
| Stop 3 | 9.673417 | 77.964222 |

Every real GPS POST and every clearly-labelled demo point goes through the same backend state machine. An arrival is saved only when the bus reaches the *next expected* stop within **30 metres**. After an arrival, the bus must move at least **45 metres** from that stop before the following stop can be detected. This hysteresis handles normal GPS drift and prevents repeat arrivals while parked. Arrival state, previous/current/next stop, completion state, and the latest event are saved on the existing `Bus` document; no new database collection or npm package is needed.

`GET /api/buses/:id/location` now additionally returns `previousStop`, `routeCompleted`, and `arrivalEvent`. The passenger dashboard displays the latest arrival message; the live map displays in-app and optional browser notifications. The admin tracking panel displays GPS status, coordinates, previous/current/next stop, update time, and connection status.

### ESP32 wiring and upload

| Device pin | ESP32 pin |
|---|---|
| NEO-6M TX | GPIO 16 (RX2) |
| NEO-6M RX | GPIO 17 (TX2) |
| NEO-6M VCC | 3.3 V or the module's documented safe supply voltage |
| NEO-6M GND | GND |
| Buzzer positive | GPIO 25 |
| Buzzer negative | GND |

1. In Arduino IDE, install the **ESP32 by Espressif Systems** board package and the **TinyGPSPlus** library.
2. Open `esp32/busyway_gps_tracker.ino`.
3. Set `WIFI_SSID`, `WIFI_PASSWORD`, `BACKEND_URL`, and `BUS_ID`. Obtain `BUS_ID` from `GET /api/buses`; use your Render URL plus `/api/location` for `BACKEND_URL`.
4. Select your ESP32 board and port, then upload. Open Serial Monitor at **115200 baud**. The GPS UART runs at **9600 baud** on GPIO 16/17.

The sketch does not contain MongoDB credentials, API keys, or a backend URL that is usable without your deployment configuration. It beeps three times only when the backend responds with a newly-created `arrivalEvent`; it then explicitly turns GPIO 25 off. The included HTTPS client uses `setInsecure()` to simplify first deployment; before production, replace that line with `setCACert(...)` using the appropriate CA certificate so the ESP32 also verifies the server identity.

### Running and verification

For a new local database, run `npm run seed` in `backend`; it intentionally clears the demo collections before creating BUS-01 and the three stops above. Do not run it against data you need to keep. For an existing database, update BUS-01's route/stops in the admin interface to the three rows above in that exact order, then reset demo mode once to clear any old arrival state.

Start the backend with `npm run dev` and the frontend with `npm run dev` from their respective directories. Required environment variables remain the existing `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT`, and frontend `VITE_API_BASE_URL`; no new secret is required.

To test with physical hardware, take valid GPS fixes at each real stop in sequence. Confirm in Serial Monitor that the POST returns HTTP 201, then confirm the response contains a non-null `arrivalEvent` only on entering the 30 m radius. Check that GPIO 25 produces exactly three short beeps, that repeated posts while stationary do not beep, and that the Passenger Live Map shows `BUS-01 has reached Stop N` after its next poll. Browser notifications require the user to press **Enable arrival alerts** and grant permission; the in-app toast is still shown without that permission.

The existing demo controls can exercise the same backend code path, but are explicitly simulated and are not a substitute for GPS accuracy validation. Actual NEO-6M performance depends on antenna placement, sky visibility, multipath interference, Wi-Fi availability, and the deployed backend being reachable.
