export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteData {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  properties: {
    distance_km: number;
    predicted_travel_time_min: number;
    average_flow: number;
    departure_time: string;
    path_nodes?: number;
  };
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}
