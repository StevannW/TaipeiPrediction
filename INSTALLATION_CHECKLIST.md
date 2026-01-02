# Installation Checklist ✓

## Pre-Installation Requirements

- [ ] **Python 3.11 or higher** installed
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/
- [ ] **Node.js 16 or higher** installed
  - Check: `node --version`
  - Download: https://nodejs.org/
- [ ] **npm** installed (comes with Node.js)
  - Check: `npm --version`
- [ ] **Git** (optional, for version control)

  - Check: `git --version`
  - Download: https://git-scm.com/

- [ ] **Stable internet connection** (for downloading dependencies and map tiles)

- [ ] **4GB+ RAM available**

- [ ] **Modern web browser** (Chrome, Firefox, Edge)

---

## Backend Installation

### Step 1: Navigate to Backend Directory

```powershell
cd backend
```

- [ ] Completed successfully

### Step 2: Create Virtual Environment

```powershell
python -m venv venv
```

- [ ] Virtual environment created
- [ ] `venv` folder appears in backend directory

### Step 3: Activate Virtual Environment

**Windows (PowerShell):**

```powershell
.\venv\Scripts\activate
```

**Windows (CMD):**

```cmd
venv\Scripts\activate.bat
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

- [ ] Virtual environment activated
- [ ] Terminal prompt shows `(venv)`

### Step 4: Upgrade pip (Recommended)

```powershell
python -m pip install --upgrade pip
```

- [ ] pip upgraded to latest version

### Step 5: Install Dependencies

```powershell
pip install -r requirements.txt
```

This will install:

- [ ] FastAPI
- [ ] Uvicorn
- [ ] Pandas
- [ ] NumPy
- [ ] OSMnx (may take 2-5 minutes)
- [ ] NetworkX
- [ ] PyTorch (may take 5-10 minutes)
- [ ] python-dateutil
- [ ] geopy

**Expected time: 5-15 minutes depending on internet speed**

- [ ] All packages installed without errors

### Step 6: Verify Installation

```powershell
python -c "import fastapi, osmnx, pandas; print('All imports successful!')"
```

- [ ] "All imports successful!" message appears

### Step 7: (Optional) Add Traffic Data

- [ ] If you have `cleaned_traffic_data_Taipeh.csv`, place it in `backend/` folder
- [ ] Or skip - app will run in mock data mode

---

## Frontend Installation

### Step 1: Navigate to Frontend Directory

```powershell
cd frontend
# Or from project root:
cd c:\Users\STEVAN\OneDrive\Documents\TaipeiSim\frontend
```

- [ ] In frontend directory

### Step 2: Install Dependencies

```powershell
npm install
```

This will install:

- [ ] React & React-DOM
- [ ] TypeScript
- [ ] Vite
- [ ] Three.js ecosystem
- [ ] Leaflet ecosystem
- [ ] Axios
- [ ] date-fns
- [ ] All type definitions

**Expected time: 2-5 minutes depending on internet speed**

- [ ] All packages installed
- [ ] `node_modules` folder created
- [ ] `package-lock.json` created
- [ ] No errors in terminal

### Step 3: Verify Installation

```powershell
npm list --depth=0
```

- [ ] List of installed packages appears
- [ ] No missing dependencies warnings

---

## First Run Test

### Backend Test

1. **Start Backend Server**

```powershell
cd backend
.\venv\Scripts\activate  # If not already active
python main.py
```

Expected output:

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Loading traffic data...
INFO:     Loading Taipei street network...
INFO:     TaipeiSim backend ready!
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

- [ ] Server starts without errors
- [ ] No red error messages
- [ ] "TaipeiSim backend ready!" message appears
- [ ] Running on port 8000

2. **Test Health Endpoint**

Open browser to: http://localhost:8000/health

Or in new terminal:

```powershell
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "traffic_records": ...,
  "graph_nodes": ...,
  "graph_edges": ...
}
```

- [ ] Health endpoint returns JSON
- [ ] Status is "healthy"
- [ ] Numbers appear for records/nodes/edges

3. **Check API Documentation**

Open browser to: http://localhost:8000/docs

- [ ] Swagger UI appears
- [ ] Can see `/calculate_route` endpoint
- [ ] Interactive API docs load

### Frontend Test

1. **Start Frontend Server**

In a NEW terminal window:

```powershell
cd frontend
npm run dev
```

Expected output:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

- [ ] Vite server starts
- [ ] No errors
- [ ] Running on port 3000

2. **Open Application**

Open browser to: http://localhost:3000

- [ ] Page loads
- [ ] 3D globe appears
- [ ] "TaipeiSim" title visible
- [ ] Control panel on right side
- [ ] No console errors (press F12)

3. **Quick Feature Test**

- [ ] Can rotate globe (click and drag)
- [ ] Can zoom globe (scroll wheel)
- [ ] Click globe → transitions to 2D map
- [ ] Can see Taipei map with tiles
- [ ] Control panel is interactive
- [ ] Search button works (🔍)

---

## Post-Installation Setup

### Optional: Create Desktop Shortcuts

**Windows:**

- [ ] Right-click `start.bat` → Send to → Desktop (create shortcut)

**Mac/Linux:**

- [ ] Make `start.sh` executable: `chmod +x start.sh`

### Optional: Configure Environment

**Backend `.env` file:**

```powershell
cd backend
copy .env.example .env
# Edit .env with your preferences
```

**Frontend `.env` file:**

```powershell
cd frontend
copy .env.example .env
# Edit .env with your preferences
```

- [ ] Environment files created (if needed)

---

## Verification Checklist

### Backend Verification

- [ ] ✅ Virtual environment works
- [ ] ✅ All packages installed
- [ ] ✅ Server starts on port 8000
- [ ] ✅ `/health` endpoint responds
- [ ] ✅ API docs accessible at `/docs`
- [ ] ✅ No import errors
- [ ] ✅ Data loads (or mock data works)

### Frontend Verification

- [ ] ✅ All npm packages installed
- [ ] ✅ Dev server starts on port 3000
- [ ] ✅ Page loads in browser
- [ ] ✅ 3D globe renders
- [ ] ✅ No console errors
- [ ] ✅ Can transition to 2D map
- [ ] ✅ Control panel functional

### Integration Verification

- [ ] ✅ Frontend can reach backend
- [ ] ✅ No CORS errors
- [ ] ✅ Can search locations
- [ ] ✅ Can calculate routes
- [ ] ✅ Route displays on map
- [ ] ✅ Statistics appear

---

## Common Installation Issues

If any step fails, check:

1. **Python version too old?**

   - Must be 3.11+
   - Check: `python --version`

2. **Node version too old?**

   - Must be 16+
   - Check: `node --version`

3. **Virtual environment not activating?**

   - Try: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Then activate again

4. **Package installation fails?**

   - Update pip: `python -m pip install --upgrade pip`
   - Update npm: `npm install -g npm@latest`
   - Check internet connection

5. **Port already in use?**

   - Backend: Change port in `main.py`
   - Frontend: Port 3000 used by something else
   - Kill process or use different port

6. **Permission errors?**
   - Windows: Run terminal as Administrator
   - Mac/Linux: Use `sudo` if needed

---

## Success Criteria ✨

You've successfully installed TaipeiSim when:

✅ Both servers start without errors
✅ Can access frontend at http://localhost:3000
✅ Can see 3D globe
✅ Can transition to 2D map
✅ Can select locations
✅ Can calculate routes
✅ Route displays with statistics

---

## Next Steps

After successful installation:

1. **Read Documentation**

   - [ ] Read `PROJECT_README.md`
   - [ ] Skim `QUICKSTART.md`
   - [ ] Bookmark `TROUBLESHOOTING.md`

2. **Explore Features**

   - [ ] Try different locations
   - [ ] Experiment with different times
   - [ ] View route statistics

3. **Optional Customization**

   - [ ] Review `DEVELOPMENT.md`
   - [ ] Customize colors/styles
   - [ ] Add your traffic data CSV

4. **Development (Optional)**
   - [ ] Set up git repository
   - [ ] Configure IDE (VSCode recommended)
   - [ ] Install dev extensions

---

## Installation Complete! 🎉

Congratulations! You now have TaipeiSim fully installed and running.

**Quick Launch Command:**

```powershell
# From project root
.\start.bat  # Windows
# or
./start.sh   # Mac/Linux
```

**Support:**

- If issues persist, see `TROUBLESHOOTING.md`
- Check console/terminal for error messages
- Ensure all checkboxes above are marked ✓

Happy routing! 🚗🗺️
