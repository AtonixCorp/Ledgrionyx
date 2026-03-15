#!/bin/bash

echo "🚀 Starting Atonix Capital Application..."
echo ""

VENV_DIR=".venv"
if [ -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
	VENV_DIR="venv"
fi

# Start backend
echo "📦 Starting Django backend..."
cd backend
source "$VENV_DIR/bin/activate" 2>/dev/null || python -m venv "$VENV_DIR" && source "$VENV_DIR/bin/activate"
pip install -r requirements.txt > /dev/null 2>&1
python manage.py migrate > /dev/null 2>&1
python manage.py runserver &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:8000"
cd ..

# Wait a moment
sleep 2

# Start frontend
echo "⚛️  Starting React frontend..."
cd frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
echo "✅ Frontend running on http://localhost:3000"
cd ..

echo ""
echo "🎉 Application is ready!"
echo "📊 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000/api"
echo "🛠️  Admin Panel: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
