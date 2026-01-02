# TaipeiSim Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Issue: `pip install` fails with "externally managed environment"

**Symptoms**: Error message about externally managed Python environment

**Solution**:

```powershell
# Always use a virtual environment
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

#### Issue: `npm install` fails with permission errors

**Symptoms**: EACCES permission denied errors

**Solution**:

```powershell
# Windows: Run PowerShell as Administrator
# Or clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Issue: OSMnx installation fails

**Symptoms**: Complex error during `pip install osmnx`

**Solution**:

```powershell
# Install separately with conda (if available)
conda install -c conda-forge osmnx

# Or use pre-built wheels
pip install --upgrade pip setuptools wheel
pip install osmnx
```

---

### Backend Issues

#### Issue: Backend won't start - "Address already in use"

**Symptoms**: Error: `[Errno 10048] Only one usage of each socket address`

**Solution**:

```powershell
# Find and kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

#### Issue: Backend starts but returns 503 errors

**Symptoms**: "Map data not loaded" or "Traffic data not loaded"

**Solution**:

1. Check backend terminal logs for startup errors
2. If OSMnx fails to download map:
   ```python
   # In main.py, the system should fall back to mock data
   # Check your internet connection
   ```
3. If CSV missing: Application runs in mock mode (expected)

#### Issue: "ModuleNotFoundError" when running backend

**Symptoms**: Python can't find installed packages

**Solution**:

```powershell
# Ensure virtual environment is activated
# You should see (venv) in terminal prompt
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue: NetworkX or OSMnx errors during route calculation

**Symptoms**: "NetworkXNoPath" or "No path found"

**Solution**:

- This is expected if locations are too far apart
- Try locations closer together in Taipei
- Check if coordinates are within Taipei bounds (25.0°N, 121.5°E)

---

### Frontend Issues

#### Issue: Frontend won't start - "Cannot find module"

**Symptoms**: TypeScript errors about missing React or other modules

**Solution**:

```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Map tiles not loading (grey boxes)

**Symptoms**: Leaflet map shows grey tiles instead of map

**Solution**:

1. **Check internet connection** - tiles load from OpenStreetMap
2. Check browser console for 403/404 errors
3. If rate-limited, wait a few minutes
4. Try different tile server in `MapView.tsx`:
   ```typescript
   url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
   // Try alternatives:
   // url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
   // url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
   ```

#### Issue: 3D Globe is black/empty

**Symptoms**: Canvas renders but no Earth visible

**Solution**:

1. Check browser WebGL support: https://get.webgl.org/
2. Update graphics drivers
3. Try different browser (Chrome recommended)
4. Check console for Three.js errors

#### Issue: TypeScript errors everywhere

**Symptoms**: Red squiggles, "Cannot find module 'react'"

**Solution**:

```powershell
# Install all dependencies
npm install

# If still errors, reinstall @types packages
npm install --save-dev @types/react @types/react-dom @types/leaflet @types/three
```

#### Issue: Leaflet marker icons not showing

**Symptoms**: Blue markers missing, only shadows visible

**Solution**:
Already fixed in code, but if issue persists:

```typescript
// In MapView.tsx, ensure these imports exist:
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
```

---

### API/Network Issues

#### Issue: "Network request failed" or CORS errors

**Symptoms**: Frontend can't reach backend

**Solution**:

1. **Verify backend is running**: Check http://localhost:8000/health
2. **Check CORS settings** in `backend/main.py`:
   ```python
   allow_origins=["*"]  # Should allow all origins
   ```
3. **Verify proxy in `vite.config.ts`**:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     }
   }
   ```
4. **Direct API call test**:
   ```powershell
   curl http://localhost:8000/health
   ```

#### Issue: Route calculation times out

**Symptoms**: Request takes >30 seconds or times out

**Solution**:

1. First-time OSMnx download is slow (expected)
2. Reduce TAIPEI_BBOX size in `main.py` for faster loading:
   ```python
   TAIPEI_BBOX = (25.0, 25.1, 121.5, 121.6)  # Smaller area
   ```
3. Check backend terminal for progress logs

#### Issue: Location search returns no results

**Symptoms**: Nominatim search returns empty

**Solution**:

1. Check internet connection
2. Nominatim has rate limits (1 request/sec)
3. Add more specific search terms: "Taipei 101, Taiwan"
4. Try searching in English

---

### Runtime Issues

#### Issue: Application is slow/laggy

**Symptoms**: Choppy animations, slow response

**Solution**:

1. **Frontend**:
   - Close other browser tabs
   - Disable browser extensions
   - Try Chrome for best Three.js performance
2. **Backend**:
   - Use smaller map area (reduce TAIPEI_BBOX)
   - Ensure adequate RAM (4GB+ recommended)

#### Issue: Route looks incorrect

**Symptoms**: Path doesn't follow roads

**Solution**:

- This can happen with simplified mock data
- Ensure real traffic CSV is loaded
- Check that OSMnx downloaded real street network
- Verify coordinates are in Taipei area

#### Issue: Map zooms to wrong location

**Symptoms**: Map centers on wrong place after search

**Solution**:

- Nominatim might return non-Taipei results
- Use more specific search: "Location, Taipei, Taiwan"
- Code filters results to Taipei bounding box

---

### Development Issues

#### Issue: Hot reload not working

**Symptoms**: Changes don't appear without manual refresh

**Solution**:

```powershell
# Frontend:
# Restart Vite dev server
npm run dev

# Backend:
# Use --reload flag
uvicorn main:app --reload
```

#### Issue: TypeScript errors but code works

**Symptoms**: Red squiggles but app runs fine

**Solution**:

```powershell
# Restart TypeScript server in VSCode
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Or check tsconfig.json is correct
```

#### Issue: CSS changes not applying

**Symptoms**: Style changes don't show

**Solution**:

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check if CSS file is imported in component
4. Restart Vite dev server

---

### Data Issues

#### Issue: "Traffic data file not found"

**Symptoms**: Backend logs warning about missing CSV

**Solution**:

- **Expected behavior**: App runs in mock data mode
- To use real data: Place `cleaned_traffic_data_Taipeh.csv` in `backend/` folder
- Mock data is fully functional for testing

#### Issue: Invalid departure time error

**Symptoms**: "Departure time must be between 2017-09-18 and 2017-09-24"

**Solution**:

- Only dates from Sept 18-24, 2017 are valid
- This matches the historical data period
- Use the datetime picker which limits the range

---

### Browser-Specific Issues

#### Chrome

- **Issue**: Three.js warnings in console
- **Solution**: Usually safe to ignore, ensure hardware acceleration enabled

#### Firefox

- **Issue**: WebGL performance slower than Chrome
- **Solution**: Enable `webgl.force-enabled` in about:config

#### Safari

- **Issue**: Some ES6+ features may not work
- **Solution**: Use Chrome or Edge for best compatibility

#### Edge

- **Issue**: Similar to Chrome, usually works well
- **Solution**: Ensure using latest version

---

## Debugging Tips

### Check Backend Logs

```powershell
# Backend terminal shows:
# - Data loading progress
# - API requests
# - Errors and warnings
```

### Check Browser Console

```
F12 -> Console tab
# Look for:
# - Network errors (fetch failures)
# - JavaScript errors
# - React warnings
```

### Check Network Tab

```
F12 -> Network tab
# Monitor:
# - API requests to /calculate_route
# - Response status codes
# - Response times
```

### Enable Debug Mode

**Backend**:

```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend**:

```typescript
// Add console.logs in components
console.log('State:', { startLocation, endLocation, routeData });
```

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Read PROJECT_README.md
3. ✅ Check browser console for errors
4. ✅ Check backend terminal for errors
5. ✅ Try restarting both servers
6. ✅ Try clearing browser cache

### When Reporting Issues

Include:

- Operating system (Windows/Mac/Linux)
- Python version: `python --version`
- Node version: `node --version`
- Full error message
- Steps to reproduce
- Screenshots (if relevant)

### Quick Health Check

```powershell
# 1. Test backend directly
curl http://localhost:8000/health

# 2. Test frontend is running
# Open: http://localhost:3000

# 3. Check processes
# Windows: tasklist | findstr "python\|node"
# Mac/Linux: ps aux | grep "python\|node"
```

---

## Still Having Issues?

If you've tried everything:

1. **Start fresh**:

   ```powershell
   # Delete and reinstall everything
   cd backend
   rm -rf venv
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt

   cd ../frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use mock data mode**: Remove CSV file to test basic functionality

3. **Check system requirements**:

   - Python 3.11+
   - Node.js 16+
   - 4GB+ RAM
   - Stable internet connection

4. **Review logs carefully**: Error messages usually indicate the exact issue

---

**Remember**: Most issues are environment-related. A clean installation usually resolves 90% of problems! 🔧
