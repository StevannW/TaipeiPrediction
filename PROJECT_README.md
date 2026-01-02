# TaipeiSim - Historical Traffic Simulation Router

A comprehensive web application that simulates optimal travel routes within Taipei City using real historical traffic data from September 18-30, 2017. The application features an interactive 3D-to-2D visualization interface with route calculation based on both distance and traffic flow.

![TaipeiSim](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

- **3D Globe View**: Interactive Earth visualization as the landing page
- **Smooth Transitions**: Seamless animation from 3D globe to 2D Taipei map
- **Location Search**: Integrated Nominatim API for address/location lookup
- **Historical Traffic Routing**: Route calculation based on real 2017 traffic data
- **Interactive Map**: Click-to-select locations on detailed Taipei city map
- **Traffic Insights**: Display distance, travel time, and average traffic flow
- **Time-based Simulation**: Select specific dates and times within the simulation window

## 📋 Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 16+** and npm (for frontend)
- **Git** (optional, for version control)

## 🚀 Installation & Setup

### Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):

   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Prepare the data file**:

   - Place your `cleaned_traffic_data_Taipeh.csv` file in the backend directory
   - If you don't have the data file, the application will run in mock data mode for testing

5. **Run the backend server**:

   ```bash
   python main.py
   ```

   The backend API will be available at `http://localhost:8000`

   Check the API health at: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
TaipeiSim/
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   └── cleaned_traffic_data_Taipeh.csv  # Historical traffic data (not included)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GlobeView.tsx          # 3D Earth visualization
│   │   │   ├── GlobeView.css
│   │   │   ├── MapView.tsx            # 2D Leaflet map
│   │   │   ├── MapView.css
│   │   │   ├── ControlPanel.tsx       # Main control interface
│   │   │   ├── ControlPanel.css
│   │   │   ├── LocationSearch.tsx     # Location search modal
│   │   │   └── LocationSearch.css
│   │   ├── App.tsx                    # Main application component
│   │   ├── App.css
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── main.tsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── readme.md                   # Original SRS document
```

## 🎮 How to Use

### Step 1: Start with the 3D Globe

- Launch the application to see the interactive 3D Earth
- You can rotate and zoom the globe

### Step 2: Select Start Location

- **Method 1**: Click the globe to select Taipei as your starting point
- **Method 2**: Use the search button (🔍) in the control panel to search for a specific location
- The view will smoothly transition from 3D globe to 2D Taipei map

### Step 3: Select Destination

- Click anywhere on the 2D map to set your destination
- Or use the search button to find a specific address

### Step 4: Set Departure Time

- Use the datetime picker to select a date/time between September 18-24, 2017
- This allows you to simulate traffic conditions at different times

### Step 5: Calculate Route

- Click the "Calculate Route" button
- The application will:
  - Query the backend API
  - Calculate the optimal route based on traffic data
  - Display the route as a blue polyline on the map
  - Show statistics: distance, travel time, and average traffic flow

### Step 6: Reset (Optional)

- Click "Reset & Return to Globe" to start over

## 🔧 API Endpoints

### `GET /`

Returns API status and version information.

### `GET /health`

Health check endpoint showing system status.

### `POST /calculate_route`

Calculate optimal route between two points.

**Request Body**:

```json
{
  "start_lat": 25.0375,
  "start_lng": 121.5637,
  "end_lat": 25.033,
  "end_lng": 121.5654,
  "departure_time": "2017-09-19T08:30:00"
}
```

**Response**:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [121.5637, 25.0375],
      [121.5654, 25.033]
    ]
  },
  "properties": {
    "distance_km": 5.4,
    "predicted_travel_time_min": 18.2,
    "average_flow": 230.5,
    "departure_time": "2017-09-19T08:30:00",
    "path_nodes": 42
  }
}
```

## 🛠️ Technologies Used

### Backend

- **FastAPI**: Modern Python web framework
- **OSMnx**: OpenStreetMap data processing
- **NetworkX**: Graph algorithms for routing
- **Pandas**: Data manipulation and analysis
- **Uvicorn**: ASGI server

### Frontend

- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for react-three-fiber
- **Leaflet**: Interactive maps
- **React-Leaflet**: React components for Leaflet
- **Axios**: HTTP client

## 🎨 Key Features Explained

### Route Calculation Algorithm

The backend uses a weighted routing algorithm:

```
weight = α * distance + β * average_flow
```

where:

- `α = 0.7`: Distance weight
- `β = 0.3`: Traffic flow weight

This balances between shortest distance and best traffic conditions.

### Mock Data Mode

If the traffic data CSV is not available, the application runs with mock data:

- Randomly generated traffic patterns
- Simplified road network
- Fully functional for testing and demonstration

### Visual Transitions

- Smooth camera animations when transitioning from 3D to 2D
- Fade-in effects for UI elements
- Animated route polyline rendering

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` for osmnx or other packages

- **Solution**: Ensure you've activated the virtual environment and installed all dependencies

**Problem**: "Map data not loaded" error

- **Solution**: Check your internet connection (OSMnx downloads map data from OpenStreetMap)

**Problem**: Backend runs but returns 503 errors

- **Solution**: Wait for the initial data loading to complete (check logs)

### Frontend Issues

**Problem**: Map tiles not loading

- **Solution**: Check your internet connection (map tiles are loaded from OpenStreetMap)

**Problem**: "Cannot find module" errors during npm install

- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: API requests fail

- **Solution**: Ensure the backend is running on port 8000

## 📊 Data Format

The application expects traffic data in CSV format with these columns:

- `day`: Date (YYYY-MM-DD)
- `interval`: Time (HH:MM)
- `detid`: Detector/Sensor ID
- `flow`: Vehicle flow rate
- `occ`: Occupancy rate
- `speed`: Average speed (km/h)
- `weekday`: Day name
- `traffic`: Traffic category

## 🚧 Future Enhancements (Phase 2+)

- **GCN-LSTM Model Integration**: Real predictive traffic inference
- **Multi-day Animation**: Replay traffic changes over time
- **User Authentication**: Save routes and preferences
- **Analytics Dashboard**: Visualize traffic patterns
- **Mobile Responsive Design**: Better support for mobile devices
- **Route Alternatives**: Show multiple route options

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or issues, please open an issue on the project repository.

---

**Note**: This is Phase 1 (Historical Simulation Mode). The application uses average flow statistics from the dataset. Future versions will integrate machine learning models for real-time predictions.
