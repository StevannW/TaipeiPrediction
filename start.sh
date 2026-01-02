#!/bin/bash
# Unix/Mac script to start the TaipeiSim application

echo "========================================"
echo "  TaipeiSim Application Launcher"
echo "========================================"
echo ""

echo "Starting Backend Server..."
cd backend
python3 main.py &
BACKEND_PID=$!
echo "Backend starting on http://localhost:8000 (PID: $BACKEND_PID)"
echo ""

sleep 3

echo "Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""

echo "========================================"
echo "  Both servers are running!"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
