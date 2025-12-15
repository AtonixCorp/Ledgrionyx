# 🚀 Quick Start Guide - Atonix Capital

Welcome! This guide will help you get the Atonix Capital application up and running.

## What You're Getting

A complete personal finance management app with:
- ⚛️  **React Frontend** - Beautiful, responsive UI with all features working
- 🐍 **Django Backend** - REST API ready to connect
- 📊 **5 Complete Pages**: Dashboard, Expenses, Income, Budget, Analytics
- 🎨 **Professional Design** - Modern UI with charts and visualizations

## 📦 What's Included

### Frontend Features (All Working!)
✅ Dashboard with real-time overview  
✅ Expense tracking with categories  
✅ Income management  
✅ Budget planning with visual progress  
✅ Analytics with charts and insights  
✅ Mock data included for testing  

### Backend Features (Ready to Use!)
✅ REST API endpoints  
✅ Database models  
✅ Admin panel  
✅ CORS configured  
✅ Automatic budget tracking  

## 🏃 Quick Start (2 Methods)

### Method 1: Automatic Setup (Easiest)

```bash
# Run setup once
./setup.sh

# Start the app
./start.sh
```

### Method 2: Manual Setup

#### Backend Setup:
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# (Optional) Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: http://localhost:8000

#### Frontend Setup:
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start server
npm start
```

Frontend runs at: http://localhost:3000

## 🎯 Testing the App

### Frontend Only (Works Right Now!)
The frontend works immediately with mock data. Just:
1. `cd frontend && npm install && npm start`
2. Open http://localhost:3000
3. Explore all features!

### Full Stack (Frontend + Backend)
1. Start both servers
2. Frontend automatically uses mock data
3. API is available at http://localhost:8000/api
4. Admin panel at http://localhost:8000/admin

## 📁 Project Structure

```
buhlayfinance/
├── frontend/           # React app (READY!)
│   ├── src/
│   │   ├── components/  # Layout, Navigation
│   │   ├── pages/       # Dashboard, Expenses, Income, Budget, Analytics
│   │   ├── context/     # State management with mock data
│   │   └── services/    # API integration (ready for backend)
│   └── package.json
│
├── backend/            # Django API (READY!)
│   ├── finances/       # Models, Views, Serializers
│   ├── finance_api/    # Settings, URLs
│   └── requirements.txt
│
├── setup.sh           # One-time setup script
├── start.sh           # Start both servers
└── README.md          # Full documentation
```

## 🎨 What You Can Do Right Now

### In the Frontend:
1. **Dashboard** - View financial overview with charts
2. **Add Expenses** - Create expenses in different categories
3. **Track Income** - Add income sources
4. **Set Budgets** - Create budget limits with progress bars
5. **View Analytics** - See spending patterns and trends

### In the Backend:
1. **Browse API** - Visit http://localhost:8000/api
2. **Admin Panel** - Manage data at http://localhost:8000/admin
3. **Test Endpoints** - Use Postman or curl

## 🔗 Available URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000/api | REST API endpoints |
| Admin Panel | http://localhost:8000/admin | Django admin |
| API Docs | http://localhost:8000/api | Browsable API |

## 📊 API Endpoints

### Expenses
- `GET /api/expenses/` - List all
- `POST /api/expenses/` - Create
- `GET /api/expenses/{id}/` - Get one
- `PUT /api/expenses/{id}/` - Update
- `DELETE /api/expenses/{id}/` - Delete

### Income
- `GET /api/income/` - List all
- `POST /api/income/` - Create
- Similar CRUD operations...

### Budgets
- `GET /api/budgets/` - List all
- `POST /api/budgets/` - Create
- Similar CRUD operations...

## 🐛 Troubleshooting

### Port Already in Use?
```bash
# Backend (port 8000)
lsof -ti:8000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing?
```bash
# Backend
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues?
```bash
cd backend
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

## 🔄 Current State

### ✅ Frontend
- **Status**: FULLY FUNCTIONAL
- **Data**: Uses mock data (no backend needed)
- **Features**: All 5 pages working perfectly

### ✅ Backend
- **Status**: FULLY READY
- **API**: All endpoints implemented
- **Database**: Models created

### 🔌 Integration
- **Status**: API service created
- **Next Step**: Update FinanceContext.js to use API instead of mock data
- **File**: `frontend/src/context/FinanceContext.js`

## 💡 Tips

1. **Start with Frontend Only**: Test all features with mock data first
2. **Check Backend**: Visit http://localhost:8000/api to see endpoints
3. **Use Admin Panel**: Create test data easily
4. **Check Console**: Look for errors in browser console or terminal

## 🎓 Next Steps

1. ✅ Run the frontend and explore features
2. ✅ Start the backend and test API endpoints
3. 🔄 (Optional) Connect frontend to backend by updating FinanceContext.js
4. 🚀 Add authentication (future enhancement)
5. 📱 Make it mobile-responsive (already started!)

## 📞 Need Help?

Check the detailed README.md files in:
- `/frontend/README.md` - Frontend specific info
- `/backend/README.md` - Backend specific info
- `/README.md` - Complete project documentation

---

**Ready to start?** Run `./setup.sh` then `./start.sh` and open http://localhost:3000!

Enjoy your finance app! 💰📊
