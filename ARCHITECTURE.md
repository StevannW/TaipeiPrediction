# TaipeiSim Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                     http://localhost:3000                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                      App.tsx                            │    │
│  │  - State Management (useState)                          │    │
│  │  - View Mode Control (3D/2D)                           │    │
│  │  - Location State                                       │    │
│  │  - Route Data State                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ GlobeView   │    │  MapView     │    │ ControlPanel │      │
│  │ (Three.js)  │    │  (Leaflet)   │    │   (UI)       │      │
│  │             │    │              │    │              │      │
│  │ - Earth     │    │ - Map Tiles  │    │ - Inputs     │      │
│  │ - Stars     │    │ - Markers    │    │ - Search     │      │
│  │ - Controls  │    │ - Polyline   │    │ - Results    │      │
│  └─────────────┘    └──────────────┘    └──────────────┘      │
│                                               │                  │
│                                               ▼                  │
│                                     ┌──────────────────┐        │
│                                     │ LocationSearch   │        │
│                                     │ (Modal)          │        │
│                                     │ - Nominatim API  │        │
│                                     └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /calculate_route
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Python)                       │
│                    http://localhost:8000                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                      main.py                            │    │
│  │                                                         │    │
│  │  Startup Event:                                         │    │
│  │  ├── Load Traffic CSV                                   │    │
│  │  ├── Build OSMnx Graph                                  │    │
│  │  └── Create Sensor Map                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Pandas    │    │   OSMnx      │    │  NetworkX    │      │
│  │             │    │              │    │              │      │
│  │ - Load CSV  │    │ - Load Map   │    │ - Find Path  │      │
│  │ - Filter    │    │ - Graph      │    │ - Shortest   │      │
│  │ - Aggregate │    │ - Nodes      │    │ - Weighted   │      │
│  └─────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
│  API Endpoints:                                                 │
│  ├── GET  /              → Status                              │
│  ├── GET  /health        → Health Check                        │
│  └── POST /calculate_route → Route Calculation                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ cleaned_traffic_data_Taipeh.csv                        │    │
│  │ - Historical traffic data (Sept 18-24, 2017)           │    │
│  │ - Flow, Speed, Occupancy                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ OpenStreetMap (via OSMnx)                              │    │
│  │ - Street network data                                   │    │
│  │ - Node and edge information                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Nominatim API (Location Search)                        │    │
│  │ - Address geocoding                                     │    │
│  │ - Location suggestions                                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action Flow:
─────────────────

1. User loads page
   └→ GlobeView renders

2. User clicks globe or searches
   └→ Transition to MapView
   └→ First location set

3. User clicks map or searches
   └→ Second location set

4. User sets time & clicks Calculate
   └→ POST request to backend
   └→ Backend calculates route
   └→ Returns GeoJSON
   └→ Frontend renders polyline
   └→ Display statistics


Request/Response Flow:
──────────────────────

Frontend                      Backend
   │                             │
   │  POST /calculate_route      │
   ├────────────────────────────>│
   │                             │
   │  {start, end, time}         │
   │                             ├─> Parse time
   │                             ├─> Get traffic data
   │                             ├─> Find nearest nodes
   │                             ├─> Calculate weights
   │                             ├─> Compute path
   │                             ├─> Build GeoJSON
   │                             │
   │  <────────────────────────┤
   │  GeoJSON + Properties       │
   │                             │
   ├─> Render route              │
   └─> Display stats             │
```

## Component State Flow

```
App.tsx (Parent)
├── viewMode: '3d' | '2d'
├── startLocation: Location | null
├── endLocation: Location | null
├── departureTime: string
├── routeData: RouteData | null
├── isLoading: boolean
└── error: string | null
    │
    ├─> GlobeView
    │   └── onLocationSelect() ──> Updates startLocation
    │                              Triggers viewMode = '2d'
    │
    ├─> MapView
    │   ├── Receives: startLocation, endLocation, routeData
    │   └── onLocationSelect() ──> Updates start/end location
    │
    └─> ControlPanel
        ├── Receives: all state
        ├── onDepartureTimeChange() ──> Updates departureTime
        ├── onCalculateRoute() ──────> Fetches route
        ├── onReset() ───────────────> Resets all state
        └── LocationSearch (child)
            └── onSelect() ──────────> Calls onLocationSelect
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────┐
│          PRESENTATION LAYER                  │
│  React Components + CSS + Animations        │
│  (GlobeView, MapView, ControlPanel)         │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│        VISUALIZATION LAYER                   │
│  Three.js (3D) + Leaflet (2D Maps)          │
│  react-three-fiber + react-leaflet          │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          STATE MANAGEMENT                    │
│  React Hooks (useState, useEffect)          │
│  Props drilling for component communication │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          NETWORK LAYER                       │
│  Fetch API / Axios                          │
│  HTTP POST to backend                       │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          API LAYER (Backend)                 │
│  FastAPI REST endpoints                     │
│  Pydantic validation                        │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          BUSINESS LOGIC                      │
│  Route calculation algorithm                │
│  Traffic flow analysis                      │
│  Graph pathfinding (NetworkX)               │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          DATA LAYER                          │
│  Pandas DataFrames (traffic data)           │
│  OSMnx Graphs (street network)              │
│  In-memory storage                          │
└─────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────┐
│          EXTERNAL SERVICES                   │
│  OpenStreetMap (map tiles & data)           │
│  Nominatim API (geocoding)                  │
└─────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────┐
│              USERS                           │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         CDN / Edge Network                   │
│         (Vercel / Netlify)                   │
│  - Frontend static files                     │
│  - Global caching                            │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Backend API Server                   │
│         (Heroku / AWS / Render)              │
│  - FastAPI application                       │
│  - Load balancer                             │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Database (Optional)                  │
│         (PostgreSQL / MongoDB)               │
│  - Traffic data storage                      │
│  - User data (future)                        │
│  - Cached routes                             │
└─────────────────────────────────────────────┘
```

## File Dependencies

```
Frontend Dependencies:
├── React (core)
├── TypeScript (typing)
├── Vite (bundler)
├── Three.js
│   ├── @react-three/fiber
│   └── @react-three/drei
├── Leaflet
│   └── react-leaflet
└── date-fns (date handling)

Backend Dependencies:
├── FastAPI (web framework)
├── Uvicorn (ASGI server)
├── Pydantic (validation)
├── Pandas (data processing)
├── NumPy (numerical computing)
├── OSMnx (map data)
├── NetworkX (graph algorithms)
├── PyTorch (future ML)
└── python-dateutil (date parsing)
```

This architecture provides a clear, maintainable, and scalable foundation for the TaipeiSim application!
