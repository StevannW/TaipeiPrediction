import React, { useState } from 'react';
import GlobeView from './components/GlobeView';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import { Location, RouteData } from './types';
import './App.css';

type ViewMode = '3d' | '2d';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('08:30');
  const [selectedModel, setSelectedModel] = useState<string>('xgboost');
  const [showDetectors, setShowDetectors] = useState<boolean>(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (location: Location, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartLocation(location);
      // Transition to 2D view when start location is filled
      if (viewMode === '3d') {
        setTimeout(() => {
          setViewMode('2d');
        }, 300);
      }
    } else {
      setEndLocation(location);
    }
  };

  const handleCalculateRoute = async () => {
    if (!startLocation || !endLocation) {
      setError('Please select both start and end locations');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRouteData(null);

    try {
      const response = await fetch('/calculate_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_lat: startLocation.lat,
          start_lng: startLocation.lng,
          end_lat: endLocation.lat,
          end_lng: endLocation.lng,
          departure_time: `2017-09-19T${departureTime}`,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to calculate route';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRouteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Route calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRouteData(null);
    setError(null);
    setViewMode('3d');
  };

  return (
    <div className="app">
      {viewMode === '3d' ? <GlobeView onLocationSelect={(loc) => handleLocationSelect(loc, 'start')} /> : <MapView startLocation={startLocation} endLocation={endLocation} routeData={routeData} onLocationSelect={handleLocationSelect} />}

      <ControlPanel
        viewMode={viewMode}
        startLocation={startLocation}
        endLocation={endLocation}
        departureTime={departureTime}
        selectedModel={selectedModel}
        showDetectors={showDetectors}
        routeData={routeData}
        isLoading={isLoading}
        error={error}
        onDepartureTimeChange={setDepartureTime}
        onModelChange={setSelectedModel}
        onToggleDetectors={setShowDetectors}
        onCalculateRoute={handleCalculateRoute}
        onReset={handleReset}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}

export default App;
