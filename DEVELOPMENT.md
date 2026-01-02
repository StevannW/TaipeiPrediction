# TaipeiSim Development Guide

## Development Environment Setup

### Backend Development

1. **Install Python dependencies in development mode**:

   ```bash
   cd backend
   pip install -r requirements.txt
   pip install pytest black flake8  # For testing and linting
   ```

2. **Run with auto-reload**:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access API documentation**:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Development

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Run development server with hot reload**:

   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## Code Structure

### Backend Architecture

```
backend/
├── main.py              # Main application entry point
│   ├── FastAPI app initialization
│   ├── CORS middleware configuration
│   ├── Startup event handler (data loading)
│   ├── Route endpoints
│   └── Helper functions
```

**Key Components**:

- **Data Loading**: Traffic data and OSMnx graph loaded on startup
- **Route Calculation**: NetworkX shortest path with custom weights
- **Mock Data**: Fallback system when real data unavailable
- **API Endpoints**: RESTful design with Pydantic validation

### Frontend Architecture

```
frontend/src/
├── App.tsx                    # Main application logic
├── components/
│   ├── GlobeView.tsx         # 3D Earth visualization
│   ├── MapView.tsx           # 2D Leaflet map with routing
│   ├── ControlPanel.tsx      # UI controls and state management
│   └── LocationSearch.tsx    # Location search modal
└── types.ts                  # TypeScript interfaces
```

**Component Hierarchy**:

```
App
├── GlobeView (when viewMode === '3d')
│   └── Canvas (Three.js)
│       ├── Earth
│       ├── Stars
│       └── OrbitControls
├── MapView (when viewMode === '2d')
│   └── MapContainer (Leaflet)
│       ├── TileLayer
│       ├── Markers
│       └── Polyline (route)
└── ControlPanel (always visible)
    ├── Location inputs
    ├── Time picker
    ├── Calculate button
    ├── Results display
    └── LocationSearch modal
```

## Customization Guide

### Adjusting Route Weights

In `backend/main.py`, modify the weight constants:

```python
ALPHA = 0.7  # Distance weight (0-1)
BETA = 0.3   # Traffic flow weight (0-1)
# Sum should equal 1.0
```

### Changing Map Region

To use a different city, update:

```python
TAIPEI_CENTER = (25.0330, 121.5654)  # (lat, lng)
TAIPEI_BBOX = (24.95, 25.15, 121.45, 121.65)  # (south, north, west, east)
```

### Styling the UI

- **Colors**: Edit CSS variables in component `.css` files
- **Layout**: Modify `ControlPanel.css` for panel positioning
- **Map Style**: Change TileLayer URL in `MapView.tsx` for different map styles

### Adding New Features

#### Backend: Add New Endpoint

```python
@app.get("/new_endpoint")
async def new_endpoint():
    return {"message": "New feature"}
```

#### Frontend: Add New Component

1. Create component file in `src/components/`
2. Import and use in `App.tsx` or other components
3. Add corresponding CSS file for styling

## Testing

### Backend Testing

Create `backend/test_main.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
```

Run tests:

```bash
pytest
```

### Frontend Testing

The project uses Vite's built-in development server with HMR (Hot Module Replacement) for instant feedback during development.

## Performance Optimization

### Backend

1. **Cache route calculations**: Implement Redis caching for frequently requested routes
2. **Database**: Move traffic data to PostgreSQL/MongoDB for faster queries
3. **Async processing**: Use background tasks for heavy computations

### Frontend

1. **Code splitting**: Use React.lazy() for component lazy loading
2. **Memoization**: Use React.memo() for expensive components
3. **Optimize renders**: Use useCallback and useMemo hooks

## Deployment

### Backend Deployment (Production)

1. **Using Gunicorn**:

   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Using Docker**:
   Create `backend/Dockerfile`:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

### Frontend Deployment

1. **Build production bundle**:

   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:

   ```bash
   npm install -g vercel
   vercel
   ```

3. **Deploy to Netlify**:
   - Connect GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `dist`

## Environment Variables

### Backend `.env`

```env
API_HOST=0.0.0.0
API_PORT=8000
DATA_PATH=cleaned_traffic_data_Taipeh.csv
ALPHA=0.7
BETA=0.3
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
VITE_MAP_TILES_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Debugging Tips

### Backend

1. **Enable detailed logging**:

   ```python
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **Use FastAPI's interactive docs**: `/docs` endpoint

3. **Print statements**: Use `logger.info()` instead of `print()`

### Frontend

1. **React DevTools**: Install browser extension
2. **Console logging**: Use `console.log()` for debugging
3. **Network tab**: Monitor API requests in browser DevTools

## Common Issues

### CORS Errors

Update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Be specific in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Map Not Loading

Check:

1. Internet connection (tiles load from OpenStreetMap)
2. Leaflet CSS is imported in `index.html`
3. Marker icons path is correct

### Route Calculation Slow

- Use smaller bbox for OSMnx graph
- Implement caching
- Consider pre-computing common routes

## Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow project's ESLint configuration
- **Commits**: Use conventional commit messages

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OSMnx Documentation](https://osmnx.readthedocs.io/)
