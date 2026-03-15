#!/bin/bash

echo "🔧 Setting up Atonix Capital..."
echo ""

VENV_DIR=".venv"
if [ -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
    VENV_DIR="venv"
fi

# Setup backend
echo "📦 Setting up Django backend..."
cd backend

# Create virtual environment
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "Installing ATC CLI..."
python -m pip install -e ../tools/atc_cli

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser prompt
echo ""
read -p "Do you want to create a superuser for admin panel? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

cd ..

# Setup frontend
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Create .env.local file
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "  ./start.sh"
echo ""
echo "To use the CLI after setup, run:"
echo "  backend/$VENV_DIR/bin/atc profiles"
echo ""
echo "Or start manually:"
echo "  Backend:  cd backend && source $VENV_DIR/bin/activate && python manage.py runserver"
echo "  Frontend: cd frontend && npm start"
