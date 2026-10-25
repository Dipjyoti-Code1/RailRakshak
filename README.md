# 🛡️ RailRakshak — Railway Passenger Safety & Emergency Platform

> **"Your Journey. Your Safety."**

RailRakshak is a modern, responsive railway passenger safety and emergency monitoring web application with a full-stack architecture connecting train travelers with on-duty Railway Protection Force (RPF) escort officers and the Central Authority Control Room.

---

## 🎯 Architecture & Core Interfaces

The application provides three connected roles through a unified FastAPI REST API:

### 1. 🚆 Passenger Safety Portal (`/` & `/passenger/onboarding`)
- **Calm, Reassuring Natural Palette**: Designed with natural greens (`#315C4C`, `#23483C`, `#E5EEE7`) and accessible typography.
- **Unsaved Draft Auto-Save**: All form entries are debounced and preserved in `localStorage`. Navigating away, hitting back, or refreshing will never lose entered passenger or journey details.
- **1-Click Demo Profiles**:
  - **Solo Passenger Demo**: Rajesh Sharma (Train 12951 Mumbai Tejas Rajdhani Express, NDLS → BCT, Coach B3, Seat 42)
  - **Family Lead Demo**: Priya Patel (Train 12004 Lucknow Swarna Shatabdi, NDLS → LKO, Coach C2, Seat 21, + Aarav & Shanti Patel)
- **Active Journey Resume**: If a journey was already registered, visitors can resume their safety dashboard with one click.
- **🚨 SOS Emergency Trigger**: Large, accessible emergency distress action with category selection (`UNWELL`, `PERSONAL SAFETY CONCERN`, `LOST OR SEPARATED`, `URGENT ASSISTANCE`, `OTHER`), passenger companion selector, and optional description.
- **Location Telemetry**: Browser Geolocation API integration with latitude/longitude, accuracy, and manual station fallback. Never invents coordinates.
- **Live Status Tracker**: Real-time status progression (`ACTIVE` ➔ `ACKNOWLEDGED` ➔ `IN PROGRESS` ➔ `RESOLVED`) synced to responder actions.

### 2. 👮 Officer On-Duty Portal (`/officer/duty`) — *Protected Staff Access*
- **Dedicated Staff Login (`/officer/login`)**: Permanent demo credentials:
  - **Username:** `officer` | **Password:** `OfficerDuty@2026` (with 1-click Quick Login)
- **Live Train Emergency Dispatch Monitor**: Actively monitors the officer's assigned train (e.g. Train 12004 or Train 12951).
- **🚨 Live SOS Notification with Chime**: When a passenger on the same train submits an SOS:
  - An emergency alert card immediately sounds an audible chime and pulses on the officer's screen.
  - Displays **Coach & Seat Location** (e.g., Coach C2, Seat 21), affected passenger details, special care needs, and reported symptoms.
  - Officer actions: **"Acknowledge SOS (Proceeding to Coach)"**, **"Mark On-Scene (In Progress)"**, and **"Resolve Emergency"**.
- **Duty Roster Registration**: Log escort shifts, assigned trains, sectors, and coach ranges.

### 3. 📡 Authority Control Room (`/authority`) — *Protected Operator Console*
- **Dedicated Operator Login (`/authority/login`)**: Permanent demo credentials:
  - **Username:** `admin` | **Password:** `ControlRoom@2026` (with 1-click Quick Login)
- **Incident Summary Metrics**: Total, Active, Acknowledged, In Progress, and Resolved incident counters.
- **OpenStreetMap & Leaflet Mapping**: Real-time GPS beacon markers with accuracy circles and external Google Maps links.
- **Algorithmic Officer Matching**: Automatically detects on-duty officers assigned to the distressed train or sector.
- **Simulate Demo Incident**: 1-click simulation with fictional passenger details and sample coordinates for offline evaluation.

### 4. 🏢 Staff Gateway Hub (`/staff`)
- Unobtrusive, centralized gateway providing staff access to both the Officer Duty Portal and Control Room without cluttering the passenger-facing website.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Hook Form, Zod, Leaflet, Lucide React, React Router v6 |
| **Backend** | Python 3, FastAPI, Pydantic v2, PyMongo, HMAC Token Auth, Uvicorn |
| **Database** | MongoDB (with automatic fallback to JSON store `backend/.data/railrakshak_store.json` when MongoDB is absent) |
| **Telemetry** | W3C Geolocation API, OpenStreetMap Tile Servers |

---

## 🚀 Running the Project

### 1. Start the Backend API (FastAPI)
```bash
# From workspace root
py backend/run.py
```
- API will start on: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Start the Frontend (React + Vite)
```bash
# Navigate to frontend directory
cd frontend
npm run dev
```
- Frontend will start on: `http://localhost:5173`

### 3. Run Backend Test Suite
```bash
# From workspace root
py -m pytest backend/tests/test_api.py -v
```

---

## 🔑 Permanent Demo Evaluation Credentials

| Portal | URL | Username | Password |
|---|---|---|---|
| **Officer Duty Portal** | [http://localhost:5173/officer/login](http://localhost:5173/officer/login) | `officer` | `OfficerDuty@2026` |
| **Control Room Console** | [http://localhost:5173/authority/login](http://localhost:5173/authority/login) | `admin` | `ControlRoom@2026` |
| **Staff Gateway** | [http://localhost:5173/staff](http://localhost:5173/staff) | *Hub directory* | — |

*Both login pages include a 1-click "Quick Demo Login" button for instant testing.*

---

## 🧪 End-to-End Test Scenario

1. Open **Officer Duty Portal** in Tab 1: [http://localhost:5173/officer/login](http://localhost:5173/officer/login)
   - Click **"1-Click Quick Demo Login"** (defaults to monitoring **Train 12004**).
2. Open **Passenger Portal** in Tab 2: [http://localhost:5173/passenger/onboarding](http://localhost:5173/passenger/onboarding)
   - Click **"🚀 Start as Priya & Family"** (Travels on **Train 12004**, Coach C2, Seat 21).
   - In the Passenger Dashboard, press **"🚨 SOS — SEND EMERGENCY ALERT"** and confirm.
3. Switch to Tab 1 (Officer Duty):
   - The officer console immediately alerts with audio chime and displays **Coach C2, Seat 21**, Priya's contact info, and the emergency distress card.
   - Click **"Acknowledge SOS"** — the status transitions across all interfaces in real time.
4. Open **Control Room** in Tab 3: [http://localhost:5173/authority/login](http://localhost:5173/authority/login)
   - Review the incident on the Leaflet map and check the matched on-duty escort officers.
