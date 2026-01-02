# Windows batch script to start the TaipeiSim application

@echo off
echo ========================================
echo   TaipeiSim Application Launcher
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start "TaipeiSim Backend" cmd /k "python main.py"
echo Backend starting on http://localhost:8000
echo.

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd ..\frontend
start "TaipeiSim Frontend" cmd /k "npm run dev"
echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo   Both servers are starting!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
