"""
TaipeiSim Backend API
Historical Traffic Simulation Router for Taipei City
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any
import pandas as pd
import osmnx as ox
import networkx as nx
import numpy as np
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TaipeiSim API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage
traffic_data: Optional[pd.DataFrame] = None
taipei_graph: Optional[nx.MultiDiGraph] = None
sensor_map: Dict[str, tuple] = {}

# Configuration
ALPHA = 0.7  # Distance weight
BETA = 0.3   # Traffic flow weight
TAIPEI_CENTER = (25.0330, 121.5654)
TAIPEI_BBOX = (24.95, 25.15, 121.45, 121.65)  # (south, north, west, east)


class RouteRequest(BaseModel):
    """Request model for route calculation"""
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    departure_time: str  # ISO format: "2017-09-19T08:30:00"


class RouteResponse(BaseModel):
    """Response model for calculated route"""
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


@app.on_event("startup")
async def startup_event():
    """Initialize data on server startup"""
    global traffic_data, taipei_graph, sensor_map
    
    logger.info("Starting TaipeiSim backend...")
    
    # Load traffic data
    try:
        data_path = Path("cleaned_traffic_data_Taipeh.csv")
        if data_path.exists():
            logger.info("Loading traffic data...")
            traffic_data = pd.read_csv(data_path)
            traffic_data['day'] = pd.to_datetime(traffic_data['day'])
            logger.info(f"Loaded {len(traffic_data)} traffic records")
        else:
            logger.warning("Traffic data file not found. Using mock data mode.")
            traffic_data = create_mock_traffic_data()
    except Exception as e:
        logger.error(f"Error loading traffic data: {e}")
        traffic_data = create_mock_traffic_data()
    
    # Load Taipei map graph
    try:
        logger.info("Loading Taipei street network...")
        # Download from OpenStreetMap - Updated for OSMnx 2.x API
        taipei_graph = ox.graph_from_bbox(
            bbox=(TAIPEI_BBOX[1], TAIPEI_BBOX[0], TAIPEI_BBOX[3], TAIPEI_BBOX[2]),  # (north, south, east, west)
            network_type='drive'
        )
        logger.info(f"Loaded graph with {len(taipei_graph.nodes)} nodes")
        
        # Create sensor map (simplified - map detid to nearest nodes)
        create_sensor_map()
        
    except Exception as e:
        logger.error(f"Error loading map: {e}")
        taipei_graph = create_mock_graph()
    
    logger.info("TaipeiSim backend ready!")


def create_mock_traffic_data() -> pd.DataFrame:
    """Create mock traffic data for testing - Extended to November 30, 2017"""
    dates = pd.date_range('2017-09-18', '2017-11-30', freq='30min')
    data = []
    for date in dates:
        for detid in range(1, 21):
            data.append({
                'day': date.date(),
                'interval': date.strftime('%H:%M'),
                'detid': f'DET{detid:03d}',
                'flow': np.random.randint(50, 300),
                'occ': np.random.uniform(10, 80),
                'speed': np.random.uniform(20, 60),
                'weekday': date.strftime('%A'),
                'traffic': np.random.choice([0, 1, 2])
            })
    return pd.DataFrame(data)


def create_mock_graph() -> nx.MultiDiGraph:
    """Create a simple mock graph for testing"""
    G = nx.MultiDiGraph()
    # Create a small grid around Taipei center
    lat_range = np.linspace(25.02, 25.05, 10)
    lng_range = np.linspace(121.55, 121.58, 10)
    
    node_id = 0
    for lat in lat_range:
        for lng in lng_range:
            G.add_node(node_id, y=lat, x=lng)
            node_id += 1
    
    # Add edges
    for i in range(len(G.nodes) - 1):
        if i % 10 != 9:  # Not at right edge
            G.add_edge(i, i + 1, length=100)
            G.add_edge(i + 1, i, length=100)
        if i < len(G.nodes) - 10:  # Not at bottom edge
            G.add_edge(i, i + 10, length=100)
            G.add_edge(i + 10, i, length=100)
    
    return G


def create_sensor_map():
    """Create mapping between sensor IDs and graph nodes"""
    global sensor_map, taipei_graph, traffic_data
    
    if traffic_data is None or taipei_graph is None:
        return
    
    # For simplicity, create random sensor positions
    unique_detids = traffic_data['detid'].unique()
    nodes = list(taipei_graph.nodes())
    
    for detid in unique_detids[:min(len(unique_detids), len(nodes))]:
        node = np.random.choice(nodes)
        node_data = taipei_graph.nodes[node]
        sensor_map[detid] = (node_data['y'], node_data['x'])


def get_nearest_node(graph: nx.MultiDiGraph, lat: float, lng: float) -> int:
    """Find nearest graph node to given coordinates"""
    try:
        return ox.distance.nearest_nodes(graph, lng, lat)
    except:
        # Fallback: manual distance calculation
        min_dist = float('inf')
        nearest = None
        for node, data in graph.nodes(data=True):
            dist = ((data['y'] - lat) ** 2 + (data['x'] - lng) ** 2) ** 0.5
            if dist < min_dist:
                min_dist = dist
                nearest = node
        return nearest


def get_average_flow(departure_time: datetime) -> float:
    """Calculate average traffic flow for given time"""
    global traffic_data
    
    if traffic_data is None:
        return 150.0  # Default flow
    
    try:
        weekday = departure_time.strftime('%A')
        time_str = departure_time.strftime('%H:%M')
        
        # Filter data
        filtered = traffic_data[
            (traffic_data['weekday'] == weekday) & 
            (traffic_data['interval'] == time_str)
        ]
        
        if len(filtered) > 0:
            return filtered['flow'].mean()
        else:
            return traffic_data['flow'].mean()
            
    except Exception as e:
        logger.error(f"Error calculating average flow: {e}")
        return 150.0


def calculate_edge_weight(length: float, avg_flow: float) -> float:
    """Calculate weighted edge cost based on distance and traffic"""
    # Normalize flow (inverse - lower flow means higher weight)
    flow_factor = max(1.0, 300 - avg_flow) / 300
    return ALPHA * length + BETA * (length * flow_factor)


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "TaipeiSim API is running",
        "version": "1.0.0",
        "status": "operational",
        "data_loaded": traffic_data is not None,
        "graph_loaded": taipei_graph is not None
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "traffic_records": len(traffic_data) if traffic_data is not None else 0,
        "graph_nodes": len(taipei_graph.nodes) if taipei_graph is not None else 0,
        "graph_edges": len(taipei_graph.edges) if taipei_graph is not None else 0
    }


@app.post("/calculate_route", response_model=RouteResponse)
async def calculate_route(request: RouteRequest):
    """
    Calculate optimal route between two points considering historical traffic
    """
    global taipei_graph, traffic_data
    
    if taipei_graph is None:
        raise HTTPException(status_code=503, detail="Map data not loaded")
    
    try:
        # Parse departure time
        departure_dt = datetime.fromisoformat(request.departure_time)
        
        # Validate time range - Extended to November 30, 2017
        if not (datetime(2017, 9, 18) <= departure_dt <= datetime(2017, 11, 30, 23, 59)):
            raise HTTPException(
                status_code=400, 
                detail="Departure time must be between 2017-09-18 and 2017-11-30"
            )
        
        # Find nearest nodes
        start_node = get_nearest_node(taipei_graph, request.start_lat, request.start_lng)
        end_node = get_nearest_node(taipei_graph, request.end_lat, request.end_lng)
        
        logger.info(f"Route from node {start_node} to {end_node}")
        
        # Get average flow for the time period
        avg_flow = get_average_flow(departure_dt)
        
        # Calculate weighted shortest path
        # Apply weights to edges
        for u, v, key, data in taipei_graph.edges(keys=True, data=True):
            length = data.get('length', 100)
            data['weight'] = calculate_edge_weight(length, avg_flow)
        
        # Find shortest path
        try:
            path = nx.shortest_path(
                taipei_graph, 
                start_node, 
                end_node, 
                weight='weight'
            )
        except nx.NetworkXNoPath:
            raise HTTPException(
                status_code=404, 
                detail="No path found between the specified locations"
            )
        
        # Build route coordinates
        coordinates = []
        total_distance = 0
        
        for node in path:
            node_data = taipei_graph.nodes[node]
            coordinates.append([node_data['x'], node_data['y']])
        
        # Calculate total distance
        for i in range(len(path) - 1):
            edge_data = taipei_graph.get_edge_data(path[i], path[i + 1])
            if edge_data:
                total_distance += list(edge_data.values())[0].get('length', 0)
        
        distance_km = total_distance / 1000
        
        # Estimate travel time (simple model: base speed + traffic factor)
        base_speed = 30  # km/h
        traffic_factor = max(0.5, min(1.5, avg_flow / 150))
        effective_speed = base_speed * traffic_factor
        travel_time_min = (distance_km / effective_speed) * 60
        
        # Build response
        response = RouteResponse(
            type="Feature",
            geometry={
                "type": "LineString",
                "coordinates": coordinates
            },
            properties={
                "distance_km": round(distance_km, 2),
                "predicted_travel_time_min": round(travel_time_min, 1),
                "average_flow": round(avg_flow, 1),
                "departure_time": request.departure_time,
                "path_nodes": len(path)
            }
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating route: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
