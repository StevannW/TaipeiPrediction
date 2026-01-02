import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location, RouteData } from '../types';
import './MapView.css';

// Fix Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Create custom icons for start and end markers
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  startLocation: Location | null;
  endLocation: Location | null;
  routeData: RouteData | null;
  onLocationSelect: (location: Location, type: 'start' | 'end') => void;
}

// Component to handle map events
function MapEvents({ onLocationSelect, startLocation, endLocation }: {
  onLocationSelect: (location: Location, type: 'start' | 'end') => void;
  startLocation: Location | null;
  endLocation: Location | null;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      // Default to 'end' (like Google Maps), but use 'start' if Shift key is held or if start is empty
      const type = (e.originalEvent.shiftKey || !startLocation) ? 'start' : 'end';
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: `Selected Point (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      }, type);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect, startLocation, endLocation]);

  return null;
}

// Component to animate map view
function MapAnimator({ startLocation }: { startLocation: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (startLocation) {
      map.flyTo([startLocation.lat, startLocation.lng], 13, {
        duration: 1.5,
      });
    }
  }, [map, startLocation]);

  return null;
}

const MapView: React.FC<MapViewProps> = ({
  startLocation,
  endLocation,
  routeData,
  onLocationSelect,
}) => {
  const TAIPEI_CENTER: [number, number] = [25.0330, 121.5654];

  // Extract route coordinates for polyline
  const routeCoordinates: [number, number][] = routeData
    ? routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]) // Swap to [lat, lng]
    : [];

  return (
    <div className="map-container fade-in">
      <MapContainer
        center={TAIPEI_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents
          onLocationSelect={onLocationSelect}
          startLocation={startLocation}
          endLocation={endLocation}
        />
        
        <MapAnimator startLocation={startLocation} />
        
        {startLocation && (
          <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
            <Popup>
              <strong>Start Location</strong>
              <br />
              {startLocation.name || `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)}`}
            </Popup>
          </Marker>
        )}
        
        {endLocation && (
          <Marker position={[endLocation.lat, endLocation.lng]} icon={endIcon}>
            <Popup>
              <strong>Destination</strong>
              <br />
              {endLocation.name || `${endLocation.lat.toFixed(4)}, ${endLocation.lng.toFixed(4)}`}
            </Popup>
          </Marker>
        )}
        
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#2194ce"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot start"></span>
          <span>Start</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot end"></span>
          <span>Destination</span>
        </div>
        {routeData && (
          <div className="legend-item">
            <span className="legend-line"></span>
            <span>Route</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
