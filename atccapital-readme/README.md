# Atonix Capital

**Sovereign Financial Intelligence Platform**

Atonix Capital is a next-generation financial platform built to redefine how individuals, businesses, and institutions interact with money. Designed at the intersection of sovereign infrastructure, intelligent finance, and multi-asset innovation, Atonix Capital empowers users with tools that transcend traditional banking.

## 🌟 Vision

To provide individuals and institutions with complete control over their financial future — securely, intelligently, and without borders.

## 💡 What Makes Us Different

Atonix Capital is not just a wallet or banking app — it is a **sovereign financial engine** combining:

- **AI-Powered Intelligence**: Advanced algorithms that predict, analyze, and guide financial decisions
- **Multi-Asset Support**: Seamlessly manage fiat, crypto, stablecoins, and tokenized assets
- **Sovereign-Grade Security**: Military-grade protection with geo-locks, time-locks, and multi-signature authorization
- **Smart Investment Vaults**: Diversified, automated wealth growth through intelligent portfolio management
- **Business-Ready Tools**: Professional-grade invoicing, payroll automation, and corporate finance
- **Borderless Network**: Global payment infrastructure built for speed and reliability

## 🚀 Core Features

### Intelligent Finance
- 🧠 **AI Financial Intelligence**: Cashflow prediction, risk analysis, fraud detection, tax estimation
- 🧬 **Financial DNA Profile**: Personalized insights into spending personality and investment style
- 📊 **Advanced Analytics**: Deep insights with real-time visualizations and trend analysis

### Wealth Management
- 💎 **Smart Investment Vaults**: Trading, Space Research, AI Research, Real Estate, DeFi, Treasury
- 💸 **Expense & Income Tracking**: Comprehensive transaction management across all asset classes
- 📈 **Budget Planning**: Dynamic allocation with smart alerts and optimization
- 📉 **Portfolio Analytics**: Multi-asset portfolio tracking and performance metrics

### Sovereign Security
- 🔐 **Multi-Layer Protection**: Geo-locking, time-locked withdrawals, multi-signature approvals
- 🕶️ **Privacy Features**: Decoy mode, encrypted transaction notes, zero-knowledge architecture
- 🛡️ **Identity & Reputation**: KYC badges, reputation scores, verified on-chain identity

### Gamification & Growth
- 🏆 **Achievement System**: Badges, levels, XP points, daily streaks
- 🗺️ **Financial Journey Maps**: Visual storytelling of wealth growth and milestones
- 🎯 **Missions & Challenges**: Engagement-driven financial education

### Technology Stack
- **Frontend**: React 18 with hooks, Context API, React Router v6
- **Backend**: Django REST Framework with RESTful API architecture
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **Security**: JWT authentication, encrypted data storage
- **UI/UX**: Modern design with react-icons, responsive layouts

## 📁 Project Structure

```
buhlayfinance/
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # State management
│   │   ├── services/      # API integration
│   │   └── App.js
│   └── package.json
│
└── backend/               # Django application
    ├── finance_api/       # Django project settings
    ├── finances/          # Main app (models, views, serializers)
    ├── manage.py
    └── requirements.txt
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 14+ and npm
- Python 3.8+
- pip

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser (optional):
```bash
python manage.py createsuperuser
```

6. Start development server:
```bash
python manage.py runserver
```

API will be available at [http://localhost:8000/api](http://localhost:8000/api)

## 🔌 API Endpoints

### Expenses
- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/` - Create expense
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense
- `GET /api/expenses/total/` - Get total expenses
- `GET /api/expenses/by_category/` - Get expenses by category

### Income
- `GET /api/income/` - List all income
- `POST /api/income/` - Create income
- `PUT /api/income/{id}/` - Update income
- `DELETE /api/income/{id}/` - Delete income
- `GET /api/income/total/` - Get total income

### Budgets
- `GET /api/budgets/` - List all budgets
- `POST /api/budgets/` - Create budget
- `PUT /api/budgets/{id}/` - Update budget
- `DELETE /api/budgets/{id}/` - Delete budget
- `GET /api/budgets/summary/` - Get budget summary

## 🎯 Current Status

### ✅ Frontend (Complete)
The frontend is fully functional with mock data and includes:
- All 5 pages (Dashboard, Expenses, Income, Budget, Analytics)
- Complete UI/UX with responsive design
- State management with React Context
- Data visualization with Recharts
- Full CRUD operations (currently with mock data)

### ✅ Backend (Complete)
The backend is ready with:
- Django REST API framework
- Complete data models
- API endpoints for all operations
- CORS enabled for frontend integration
- Admin panel configured

### 🔄 Integration (Ready)
To connect frontend to backend:
1. Start both servers (frontend on :3000, backend on :8000)
2. Update `FinanceContext.js` to use API calls instead of mock data
3. The API service (`services/api.js`) is already created

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
python manage.py test
```

## 📝 Environment Variables

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Backend
Update `settings.py` for production:
- Set `DEBUG = False`
- Update `SECRET_KEY`
- Configure `ALLOWED_HOSTS`
- Use PostgreSQL for production database

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy the build/ directory to your hosting service
```

### Backend
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Run migrations: `python manage.py migrate`
4. Collect static files: `python manage.py collectstatic`
5. Deploy with Gunicorn/uWSGI + Nginx

### GitHub Deployment Guide

For the full GitHub-oriented deployment process, including GitHub Actions, container builds, Kubernetes promotion, Terraform notes, and required secrets, see [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md).

## 📚 Tech Stack

### Frontend
- React 18
- React Router v6
- Recharts (data visualization)
- Axios (HTTP client)
- Context API (state management)

### Backend
- Django 4.2
- Django REST Framework
- SQLite (development) / PostgreSQL (production)
- CORS Headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👤 Author

Atonix Capital Team

---

**Note**: The frontend currently uses mock data and is fully functional. To connect it to the Django backend, you'll need to update the FinanceContext to use the API calls from `services/api.js`.
