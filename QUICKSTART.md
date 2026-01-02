# Quick Start Guide

## Installation (First Time Only)

### 1. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend Setup

```powershell
cd frontend
npm install
```

## Running the Application

### Option 1: Using the Launcher (Easiest)

**Windows:**

```powershell
.\start.bat
```

**Mac/Linux:**

```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**

```powershell
cd backend
.\venv\Scripts\activate  # Windows
python main.py
```

**Terminal 2 - Frontend:**

```powershell
cd frontend
npm run dev
```

## Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. The backend API runs at: **http://localhost:8000**

## First-Time Usage

1. **3D Globe View** appears
2. Click the **search button** (🔍) or click the globe
3. Search for "Taipei 101" or similar location
4. Click on the map to select destination
5. Set departure time (Sept 18-24, 2017)
6. Click **"Calculate Route"**
7. View your route and statistics!

## Troubleshooting

**Backend won't start?**

- Make sure virtual environment is activated
- Run: `pip install -r requirements.txt` again

**Frontend won't start?**

- Delete `node_modules` folder
- Run: `npm install` again

**Can't see the map?**

- Check your internet connection
- Map tiles load from OpenStreetMap

**API errors?**

- Make sure backend is running on port 8000
- Check backend terminal for error messages

## Need Help?

- Read **PROJECT_README.md** for detailed documentation
- Read **DEVELOPMENT.md** for development guidelines
- Check the original **readme.md** for SRS specifications

## Quick Commands Reference

```powershell
# Backend
cd backend
python main.py                    # Start server
python main.py --reload           # Start with auto-reload

# Frontend
cd frontend
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run preview                   # Preview production build

# Both
# Windows: .\start.bat
# Mac/Linux: ./start.sh
```

## Data Files

The application works in two modes:

1. **With Traffic Data**: Place `cleaned_traffic_data_Taipeh.csv` in `backend/` directory
2. **Mock Data Mode**: Works automatically if no CSV file is present

Enjoy using TaipeiSim! 🚗🗺️
