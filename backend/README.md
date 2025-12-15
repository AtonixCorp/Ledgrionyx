# Atonix Capital Backend

Django REST API backend for the Atonix Capital application.

## Features

- RESTful API endpoints for expenses, income, and budgets
- CRUD operations for all financial data
- CORS enabled for frontend integration
- SQLite database (easily switchable to PostgreSQL/MySQL)

## Setup

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

The API will be available at [http://localhost:8000](http://localhost:8000)

## API Endpoints

### Expenses
- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/` - Create new expense
- `GET /api/expenses/{id}/` - Get expense details
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense

### Income
- `GET /api/income/` - List all income
- `POST /api/income/` - Create new income
- `GET /api/income/{id}/` - Get income details
- `PUT /api/income/{id}/` - Update income
- `DELETE /api/income/{id}/` - Delete income

### Budgets
- `GET /api/budgets/` - List all budgets
- `POST /api/budgets/` - Create new budget
- `GET /api/budgets/{id}/` - Get budget details
- `PUT /api/budgets/{id}/` - Update budget
- `DELETE /api/budgets/{id}/` - Delete budget

## Project Structure

```
backend/
├── finance_api/        # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── finances/           # Main app
│   ├── models.py       # Database models
│   ├── serializers.py  # DRF serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── manage.py
└── requirements.txt
```

## Database Models

### Expense
- description (CharField)
- amount (DecimalField)
- category (CharField)
- date (DateField)

### Income
- source (CharField)
- amount (DecimalField)
- date (DateField)

### Budget
- category (CharField)
- limit (DecimalField)
- spent (DecimalField)
- color (CharField)

## License

MIT License
