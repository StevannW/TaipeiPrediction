

---

# **Software Requirements Specification (SRS)**

## **Project: TaipehSim – A Historical Simulation Router**
---

## **1. Introduction**

### **1.1 Purpose**

*TaipehSim* aims to simulate optimal travel routes within **Taipei City** using real historical traffic data (September 18–30, 2017). It calculates the “best” route between two points based on both **distance** and **traffic flow**, presented through a visually rich, interactive interface.

### **1.2 Scope**

The system includes:

* A **backend API (FastAPI)** performing route simulation and inference based on historical CSV data.
* A **frontend web interface (React + Leaflet + 3D Globe)** providing interactive visualization from a **3D global view** to a **2D Taipei map view** once a user selects a location.

Two phases of development:

* **Phase 1 – Historical Simulation Mode:** Uses average flow statistics from the dataset (no ML model yet).
* **Phase 2 – Predictive Inference Mode:** Integrates trained GCN-LSTM model (.pth) for live predictions.

---

## **2. Overall Description**

### **2.1 Product Perspective**

TaipehSim is a hybrid visualization and simulation platform combining 3D Earth view and 2D detailed routing:

* Users begin on a **3D globe interface**.
* Once one or both locations are selected, the system transitions smoothly to a **2D Taipei map** where markers and routes are drawn.

### **2.2 Product Functions**

1. Display 3D globe view (worldwide perspective).
2. Allow users to search and select start and/or destination locations.
3. Automatically transition to 2D Taipei map after first valid location selection.
4. Compute and display best route when both points and time are set.
5. Return and render metadata such as distance, predicted travel time, and average flow.

### **2.3 Users**

* **General Users / Researchers:** Analyze or visualize historical urban traffic routing.
* **Students / Developers:** Study routing AI or experiment with spatio-temporal data visualization.

### **2.4 Operating Environment**

* **Backend:** FastAPI, Uvicorn, Python 3.11+, Pandas, OSMnx, NetworkX, PyTorch.
* **Frontend:** React, Leaflet, Three.js or CesiumJS (for 3D globe), Axios / Fetch.
* **Map Source:** OpenStreetMap.
* **Dataset:** `cleaned_traffic_data_Taipeh.csv`.
* **Deployment:** Initially local; future-ready for separate hosting.

---

## **3. Functional Requirements**

### **3.1 Backend (Simulation Engine)**

*(same as version 1.0 — retained for completeness)*

#### **FR-1. On Startup**

* Load `cleaned_traffic_data_Taipeh.csv` into a Pandas DataFrame.
* Pre-index by `day` and `interval`.
* Load Taipei map via OSMnx.
* Build temporary sensor map from node coordinates.
* Prepare model placeholder (`model = None` for Phase 1).

#### **FR-2. API Endpoint**

**POST /calculate_route**

**Request Body**

```json
{
  "start_lat": 25.0375,
  "start_lng": 121.5637,
  "end_lat": 25.0330,
  "end_lng": 121.5654,
  "departure_time": "2017-09-19T08:30:00"
}
```

**Processing Steps**

1. Parse `departure_time` → derive weekday & interval.
2. Extract 12-hour historical context data.
3. Compute **average flow** by matching weekday and interval.
4. Apply weighted routing:

   ```
   weight = α * distance + β * average_flow
   ```
5. Compute path using `networkx.shortest_path()`.
6. Build GeoJSON + metadata.

**Response**

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[121.5637, 25.0375], [121.5654, 25.0330]]
  },
  "properties": {
    "distance_km": 5.4,
    "predicted_travel_time_min": 18.2,
    "average_flow": 230.5,
    "departure_time": "2017-09-19T08:30:00"
  }
}
```

---

### **3.2 Frontend (User Interface)**

#### **FR-3. 3D Globe View**

* Implement **3D globe** as the landing screen using either:

  * **Three.js (with react-three-fiber)**, or
  * **CesiumJS** for satellite-accurate rendering.
* Display earth with basic lighting and rotation disabled by default (static globe).
* User can:

  * Zoom, rotate, and pan slightly.
  * Click or search for a location (using Nominatim).
* When user selects one location:

  * Camera automatically **zooms in to Taipei City** region.
  * Transition from **3D globe → 2D map** (Leaflet view).
  * Drop a **marker** at the chosen location.

#### **FR-4. 2D Map View (Leaflet)**

* Once in 2D view:

  * Display the Taipei map (centered at ~25.03°N, 121.56°E).
  * Show previously selected marker.
  * Allow user to pick the second location directly on map or via search.
* Transition uses animation easing (1–2 seconds smooth zoom).

#### **FR-5. Location Search**

* Use Nominatim API:

  ```
  https://nominatim.openstreetmap.org/search?q={query}&format=json
  ```
* Provide a dropdown of results.
* Clicking result stores coordinates and triggers transition logic.

#### **FR-6. Time Picker**

* Display datetime input limited to:

  ```
  min="2017-09-18T00:00"
  max="2017-09-24T23:59"
  ```
* Validate within simulation window.

#### **FR-7. Route Calculation**

1. User selects start, end, and time → click **“Calculate Route.”**
2. Display loading spinner (backend ~2–5 seconds).
3. Fetch route via POST `/calculate_route`.
4. Render **polyline** on map, add markers for start/end.
5. Display metadata in info box:

   * Distance (km)
   * Predicted Travel Time (minutes)
   * Average Flow
   * Departure Time

#### **FR-8. Transitions & States**

| User Action             | System Response                                  |
| ----------------------- | ------------------------------------------------ |
| Select 1st location     | Zooms from 3D globe → 2D Taipei map; drop marker |
| Select 2nd location     | Add destination marker                           |
| Click “Calculate Route” | Backend request + loading spinner                |
| Route received          | Polyline drawn; show stats panel                 |
| Error                   | Alert with description; no map reset             |

#### **FR-9. Error Handling**

* If backend unreachable → modal “Server not responding.”
* If input invalid → highlight missing fields, display tooltip.

---

## **4. Non-Functional Requirements**

| **Category**        | **Requirement**                                             |
| ------------------- | ----------------------------------------------------------- |
| **Performance**     | Route computation under 5 seconds.                          |
| **Visual Quality**  | Smooth 3D → 2D transition ≤ 2 s; 60 FPS rendering.          |
| **Scalability**     | API stateless; can deploy backend separately.               |
| **Usability**       | User can complete full route request in ≤ 3 interactions.   |
| **Portability**     | Runs on Windows, macOS, or Linux.                           |
| **Maintainability** | Modular React components + service-based FastAPI structure. |
| **Reliability**     | Graceful failure on missing data.                           |
| **Accessibility**   | Support keyboard and mouse controls for map.                |

---

## **5. System Architecture**

```
 ┌────────────────────────────────────┐
 │           React Frontend           │
 │ ┌────────────┐   ┌──────────────┐ │
 │ │ 3D Globe   │→→→│ 2D Leaflet   │ │
 │ │ (CesiumJS) │   │ Map View     │ │
 │ └────────────┘   └──────────────┘ │
 │   ▲ Search Input + Time Picker    │
 │   │                              │
 │   └──────→ Axios POST /calculate │
 └───────────────────────────────────┘
               │
               ▼
 ┌────────────────────────────────────┐
 │         FastAPI Backend            │
 │  - Load cleaned_traffic_data_Taipeh.csv │
 │  - Simulate average flow           │
 │  - Compute weighted route          │
 │  - Return GeoJSON + Metadata       │
 └────────────────────────────────────┘
```

---

## **6. Data Specification**

| Column     | Description                |
| ---------- | -------------------------- |
| `day`      | Calendar date (YYYY-MM-DD) |
| `interval` | Time slice (e.g., 08:30)   |
| `detid`    | Sensor/Detector ID         |
| `flow`     | Vehicle flow rate          |
| `occ`      | Occupancy rate             |
| `error`    | Error flag                 |
| `city`     | “Taipei”                   |
| `speed`    | Average speed (km/h)       |
| `weekday`  | Day name (Mon–Sun)         |
| `traffic`  | Encoded traffic category   |

---

## **7. API Specification**

| Method | Endpoint           | Description                                         |
| ------ | ------------------ | --------------------------------------------------- |
| `POST` | `/calculate_route` | Calculates optimal route given two points and time. |

**Response Example**

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[121.5637, 25.0375], [121.5654, 25.0330]]
  },
  "properties": {
    "distance_km": 5.4,
    "predicted_travel_time_min": 18.2,
    "average_flow": 230.5,
    "departure_time": "2017-09-19T08:30:00"
  }
}
```

---

## **8. Frontend Workflow (Visual Flow)**

1. **3D Globe Initialization:**
   Display Earth with minimal animation.
   Await user input or search.

2. **First Location Input:**

   * Zoom smoothly to Taipei City.
   * Switch to 2D map mode.
   * Place marker.

3. **Second Location Input:**

   * Add destination marker.

4. **Time Selection:**

   * User picks valid datetime in simulation window.

5. **Route Calculation:**

   * Fetch backend route.
   * Draw polyline + metadata overlay.

6. **User Feedback:**

   * Info panel shows stats.
   * Option to clear map and reset to globe.

---

## **9. Future Development**

* **Phase 2:** Integrate GCN-LSTM model inference (`.pth`).
* **Phase 3:** Multi-day replay animation of traffic changes.
* **Phase 4:** Deploy frontend (e.g., Vercel) + backend (Render / AWS).
* **Phase 5:** Optional user login, saved routes, and analytics dashboard.

---

