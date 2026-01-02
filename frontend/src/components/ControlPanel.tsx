import React, { useState } from 'react';
import { Location, RouteData } from '../types';
import './ControlPanel.css';

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'xgboost',
    name: 'XGBoost',
    description: 'Extreme Gradient Boosting - A powerful ensemble learning method that builds sequential decision trees. Excels at handling non-linear patterns and feature interactions in traffic data. Best for overall accuracy and speed prediction.'
  },
  {
    id: 'random_forest',
    name: 'Random Forest',
    description: 'Random Forest - An ensemble method using multiple decision trees trained on random data subsets. Provides robust predictions and handles outliers well. Good balance between accuracy and interpretability for traffic patterns.'
  },
  {
    id: 'neural_network',
    name: 'Neural Network',
    description: 'Deep Neural Network - A multi-layered network capable of learning complex temporal and spatial patterns. Captures intricate relationships in traffic flow. Best for discovering hidden patterns in large-scale traffic data.'
  }
];

// Dummy detector data - will be replaced with backend data
const DUMMY_DETECTORS = [
  { id: 'D001', lat: 25.0330, lng: 121.5654, name: 'Xinyi Detector' },
  { id: 'D002', lat: 25.0478, lng: 121.5170, name: 'Taipei Main Station Detector' },
  { id: 'D003', lat: 25.0375, lng: 121.5637, name: 'Taipei 101 Detector' },
  { id: 'D004', lat: 25.0520, lng: 121.5435, name: 'Zhongshan Detector' },
  { id: 'D005', lat: 25.0419, lng: 121.5358, name: 'Daan Detector' },
  { id: 'D006', lat: 25.0620, lng: 121.5250, name: 'Shilin Detector' },
  { id: 'D007', lat: 25.0282, lng: 121.5142, name: 'Wanhua Detector' },
  { id: 'D008', lat: 25.0510, lng: 121.5567, name: 'Songshan Detector' },
];

interface ControlPanelProps {
  viewMode: '3d' | '2d';
  startLocation: Location | null;
  endLocation: Location | null;
  departureTime: string;
  selectedModel: string;
  routeData: RouteData | null;
  isLoading: boolean;
  error: string | null;
  showDetectors: boolean;
  onDepartureTimeChange: (time: string) => void;
  onModelChange: (model: string) => void;
  onCalculateRoute: () => void;
  onReset: () => void;
  onLocationSelect: (location: Location, type: 'start' | 'end') => void;
  onToggleDetectors: (show: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ viewMode, startLocation, endLocation, departureTime, selectedModel, routeData, isLoading, error, showDetectors, onDepartureTimeChange, onModelChange, onCalculateRoute, onReset, onLocationSelect, onToggleDetectors }) => {
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [startInputFocused, setStartInputFocused] = useState(false);
  const [endInputFocused, setEndInputFocused] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const searchTimeoutRef = React.useRef<number>();
  const modelDropdownRef = React.useRef<HTMLDivElement>(null);
  const modelInfoRef = React.useRef<HTMLDivElement>(null);

  // Update input when location is selected from map/globe
  React.useEffect(() => {
    if (startLocation) {
      const locationText = startLocation.name || `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)}`;
      if (startInput !== locationText) {
        setStartInput(locationText);
      }
    }
  }, [startLocation]);

  React.useEffect(() => {
    if (endLocation) {
      const locationText = endLocation.name || `${endLocation.lat.toFixed(4)}, ${endLocation.lng.toFixed(4)}`;
      if (endInput !== locationText) {
        setEndInput(locationText);
      }
    }
  }, [endLocation]);

  const searchLocation = async (query: string, type: 'start' | 'end') => {
    console.log(`searchLocation called - type: ${type}, query: "${query}", length: ${query.length}`);
    
    if (query.length < 2) {
      if (type === 'start') {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
        setIsSearchingStart(false);
      } else {
        setEndSuggestions([]);
        setShowEndSuggestions(false);
        setIsSearchingEnd(false);
      }
      return;
    }

    if (type === 'start') {
      setIsSearchingStart(true);
    } else {
      setIsSearchingEnd(true);
    }

    try {
      // Try multiple search strategies for better results
      let data: any[] = [];
      
      // Strategy 1: Search with Taipei context
      const searchQuery = query.includes('taipei') || query.includes('Taipei') 
        ? query 
        : `${query}, Taipei`;
      
      const url1 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=tw&limit=10&addressdetails=1`;
      console.log('Fetching strategy 1:', url1);
      
      const response1 = await fetch(url1);
      if (response1.ok) {
        data = await response1.json();
        console.log(`Strategy 1 results for "${query}":`, data.length, 'items');
      }
      
      // Strategy 2: If no results, try without Taipei context
      if (data.length === 0) {
        const url2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=tw&limit=10&addressdetails=1`;
        console.log('Fetching strategy 2:', url2);
        const response2 = await fetch(url2);
        if (response2.ok) {
          data = await response2.json();
          console.log(`Strategy 2 results for "${query}":`, data.length, 'items');
        }
      }

      // Filter and sort results to prioritize Taipei area
      const taipeiResults = data.filter((item: any) => 
        item.display_name.toLowerCase().includes('taipei') ||
        item.display_name.toLowerCase().includes('臺北') ||
        item.display_name.toLowerCase().includes('台北')
      );
      
      const otherResults = data.filter((item: any) => 
        !item.display_name.toLowerCase().includes('taipei') &&
        !item.display_name.toLowerCase().includes('臺北') &&
        !item.display_name.toLowerCase().includes('台北')
      );
      
      // Combine: Taipei results first, then others
      const sortedData = [...taipeiResults, ...otherResults].slice(0, 8);

      if (type === 'start') {
        setStartSuggestions(sortedData);
        console.log('Setting showStartSuggestions to true, data:', sortedData);
        setShowStartSuggestions(true);
        setIsSearchingStart(false);
      } else {
        setEndSuggestions(sortedData);
        console.log('Setting showEndSuggestions to true, data:', sortedData);
        setShowEndSuggestions(true);
        setIsSearchingEnd(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (type === 'start') {
        setIsSearchingStart(false);
      } else {
        setIsSearchingEnd(false);
      }
    }
  };

  const handleInputChange = (value: string, type: 'start' | 'end') => {
    console.log(`handleInputChange - type: ${type}, value: "${value}"`);
    
    if (type === 'start') {
      setStartInput(value);
      if (value.length < 2) {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      }
    } else {
      setEndInput(value);
      if (value.length < 2) {
        setEndSuggestions([]);
        setShowEndSuggestions(false);
      }
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      if (type === 'start') {
        setIsSearchingStart(false);
      } else {
        setIsSearchingEnd(false);
      }
      return;
    }

    if (type === 'start') {
      setIsSearchingStart(true);
    } else {
      setIsSearchingEnd(true);
    }
    
    searchTimeoutRef.current = window.setTimeout(() => {
      console.log(`Timeout fired - calling searchLocation for ${type}`);
      searchLocation(value, type);
    }, 800);
  };

  const handleSuggestionSelect = (suggestion: any, type: 'start' | 'end') => {
    const location: Location = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      name: suggestion.display_name,
    };

    onLocationSelect(location, type);

    if (type === 'start') {
      setStartInput(suggestion.display_name);
      setShowStartSuggestions(false);
      setStartSuggestions([]);
    } else {
      setEndInput(suggestion.display_name);
      setShowEndSuggestions(false);
      setEndSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, type: 'start' | 'end') => {
    if (e.key === 'Enter') {
      const suggestions = type === 'start' ? startSuggestions : endSuggestions;
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0], type);
      }
    }
  };

  const handleReset = () => {
    setStartInput('');
    setEndInput('');
    setStartSuggestions([]);
    setEndSuggestions([]);
    setShowStartSuggestions(false);
    setShowEndSuggestions(false);
    setHoveredModel(null);
    setIsModelDropdownOpen(false);
    onReset();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setHoveredModel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDateTime = (dateStr: string) => {
    return dateStr.replace('T', ' ');
  };

  return (
    <div className={`control-panel ${viewMode === '3d' ? 'globe-mode' : 'map-mode'}`}>
      <div className="panel-header">
        <div className="logo-title">
          <img src="/logo.svg" alt="TaipeiSim Logo" className="app-logo" />
          <div>
            <h2>TaipeiSim</h2>
            <p className="chinese-subtitle">机北天练线</p>
          </div>
        </div>
        <div className="header-bottom">
          <p className="subtitle">Historical Traffic Router</p>
          <div className="detector-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showDetectors}
                onChange={(e) => onToggleDetectors(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Detectors</span>
            </label>
          </div>
        </div>
      </div>

      <div className="panel-content">
        {/* Location Selection */}
        <div className="section">
          <h3>📍 Locations</h3>
          {viewMode === '2d' && (
            <p className="map-hint">💡 Click map to set destination (Shift+Click for start)</p>
          )}

          <div className="location-input">
            <label>Start Location</label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                className="location-text-input"
                placeholder="Type location name or address..."
                value={startInput}
                onChange={(e) => handleInputChange(e.target.value, 'start')}
                onKeyPress={(e) => handleKeyPress(e, 'start')}
                onFocus={() => {
                  setStartInputFocused(true);
                  console.log('Start input focused, suggestions:', startSuggestions.length);
                  if (startInput.length >= 2 && startSuggestions.length > 0) {
                    setShowStartSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setStartInputFocused(false);
                  setTimeout(() => {
                    console.log('Start input blurred, hiding suggestions');
                    setShowStartSuggestions(false);
                  }, 500);
                }}
              />
              {isSearchingStart && <div className="search-loading">Searching...</div>}
              {showStartSuggestions && startSuggestions.length > 0 && (
                <div className="suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  {startSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item" onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionSelect(suggestion, 'start');
                    }}>
                      <div className="suggestion-name">{suggestion.name || suggestion.display_name.split(',')[0]}</div>
                      <div className="suggestion-address">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="location-input">
            <label>Destination</label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                className="location-text-input"
                placeholder="Type location name or address..."
                value={endInput}
                onChange={(e) => handleInputChange(e.target.value, 'end')}
                onKeyPress={(e) => handleKeyPress(e, 'end')}
                onFocus={() => {
                  setEndInputFocused(true);
                  console.log('End input focused, suggestions:', endSuggestions.length);
                  if (endInput.length >= 2 && endSuggestions.length > 0) {
                    setShowEndSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setEndInputFocused(false);
                  setTimeout(() => {
                    console.log('End input blurred, hiding suggestions');
                    setShowEndSuggestions(false);
                  }, 500);
                }}
              />
              {isSearchingEnd && <div className="search-loading">Searching...</div>}
              {showEndSuggestions && endSuggestions.length > 0 && (
                <div className="suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  {endSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item" onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionSelect(suggestion, 'end');
                    }}>
                      <div className="suggestion-name">{suggestion.name || suggestion.display_name.split(',')[0]}</div>
                      <div className="suggestion-address">{suggestion.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="section">
          <h3>🕐 Departure Time</h3>
          <div className="time-input">
            <input 
              type="time" 
              value={departureTime} 
              onChange={(e) => onDepartureTimeChange(e.target.value)} 
              onClick={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.showPicker) {
                  target.showPicker();
                }
              }}
              title="Select departure time" 
            />
            <p className="time-note">Date fixed: September 19, 2017</p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="section">
          <h3>🤖 Prediction Model</h3>
          <div className="model-select-container" ref={modelDropdownRef}>
            <div className="model-select-wrapper">
              <div 
                className={`custom-select ${isModelDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              >
                <div className="select-selected">
                  {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}
                </div>
                <div className={`select-arrow ${isModelDropdownOpen ? 'open' : ''}`}>▼</div>
              </div>
              <div 
                className="model-info-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelInfo(!showModelInfo);
                }}
                title="Click to see model description"
              >
                ℹ️
              </div>
            </div>
            
            {/* Custom dropdown options */}
            {isModelDropdownOpen && (
              <div className="select-options">
                {MODEL_OPTIONS.map((model) => (
                  <div
                    key={model.id}
                    className={`select-option ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsModelDropdownOpen(false);
                      setHoveredModel(null);
                    }}
                  >
                    <span>{model.name}</span>
                    {selectedModel === model.id && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            )}
            
            {/* Model info popup - shown when clicking info icon */}
            {showModelInfo && (
              <div className="model-info-overlay" onClick={() => setShowModelInfo(false)}>
                <div className="model-tooltip-popup" ref={modelInfoRef} onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="popup-close-btn"
                    onClick={() => setShowModelInfo(false)}
                    title="Close"
                  >
                    ×
                  </button>
                  <div className="tooltip-header">
                    <strong>{MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}</strong>
                    <span className="selected-indicator">Selected</span>
                  </div>
                  <p className="tooltip-description">
                    {MODEL_OPTIONS.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="section">
          <button className="calculate-btn" onClick={onCalculateRoute} disabled={!startLocation || !endLocation || isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Calculating...
              </>
            ) : (
              'Calculate Route'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Route Results */}
        {routeData && (
          <div className="section results-section">
            <h3>Route Information</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{routeData.properties.distance_km.toFixed(2)} km</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Est. Travel Time</span>
                <span className="stat-value">{routeData.properties.predicted_travel_time_min.toFixed(0)} min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg. Traffic Flow</span>
                <span className="stat-value">{routeData.properties.average_flow.toFixed(0)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Departure</span>
                <span className="stat-value small">{formatDateTime(routeData.properties.departure_time)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(startLocation || endLocation) && (
          <div className="section">
            <button className="reset-btn" onClick={handleReset}>
              Reset & Return to Globe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
