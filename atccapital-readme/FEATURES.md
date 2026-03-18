# 🎨 Atonix Capital - Features & Screenshots Guide

## 📱 Application Pages

### 1. 📊 Dashboard
**What it does:**
- Shows financial overview at a glance
- Displays total income, expenses, and balance
- Visual charts for expense distribution
- Budget overview bar chart
- Recent transactions table

**Key Features:**
- 3 Summary cards (Income, Expenses, Balance)
- Pie chart showing expense categories
- Bar chart comparing budget spent vs limit
- Last 5 transactions listed
- Color-coded status indicators

**Mock Data Included:**
- Sample expenses across multiple categories
- Sample income from different sources
- Pre-configured budgets

---

### 2. 💸 Expenses Page
**What it does:**
- Add new expenses with description, amount, category, and date
- View all expenses in a sortable table
- Delete expenses
- See total expenses

**Key Features:**
- Toggle form to add expenses
- Category dropdown (Food, Transportation, Entertainment, etc.)
- Date picker for expense date
- Automatic total calculation
- Delete functionality with budget auto-update
- Responsive table design

**Categories Available:**
- Food
- Transportation
- Entertainment
- Utilities
- Health
- Shopping
- Other

---

### 3. 💵 Income Page
**What it does:**
- Track income from multiple sources
- Add new income entries
- View all income records
- Delete income entries
- See total income

**Key Features:**
- Source field (Salary, Freelance, Investments, etc.)
- Amount and date tracking
- Clean table layout
- Total income display
- Quick add/delete operations

**Example Sources:**
- Salary
- Freelance Project
- Investment Returns
- Side Business
- Bonuses

---

### 4. 📈 Budget Page
**What it does:**
- Create budget limits for different categories
- Monitor spending against budgets
- Visual progress bars
- Warnings when approaching limits
- Track remaining budget

**Key Features:**
- Budget cards with visual progress
- Color-coded progress bars:
  - Green: < 70% used
  - Orange: 70-89% used
  - Red: 90%+ used
- Spent, Limit, and Remaining amounts
- Warning alerts for over-budget categories
- Delete budget functionality

**Smart Features:**
- Auto-updates when expenses are added
- Percentage calculation
- Remaining amount display
- Over-budget detection

---

### 5. 📉 Analytics Page
**What it does:**
- Comprehensive financial insights
- Multiple chart visualizations
- Top expenses analysis
- Monthly trends
- Key metrics dashboard

**Key Features:**

**Metric Cards:**
- Savings Rate percentage
- Total Balance
- Total Income
- Total Expenses

**Charts:**
1. **Expense Distribution** (Pie Chart)
   - Shows spending by category
   - Percentage breakdown
   - Color-coded categories

2. **Category-wise Spending** (Bar Chart)
   - Compare spending across categories
   - Dollar amounts displayed

3. **Income vs Expenses Trend** (Line Chart)
   - Monthly comparison
   - Track financial health over time
   - See patterns and trends

**Top 5 Expenses:**
- Ranked list of biggest expenses
- Shows description, category, date
- Amount highlighted

---

## 🎨 Design Features

### Color Scheme
- **Primary**: Purple gradient (`#667eea` to `#764ba2`)
- **Success/Income**: Green (`#2ecc71`)
- **Danger/Expense**: Red (`#e74c3c`)
- **Info**: Blue (`#3498db`)
- **Warning**: Orange (`#f39c12`)

### UI Components
- Modern card-based layout
- Smooth hover effects
- Responsive grid system
- Professional typography
- Icon integration (emoji-based)

### Navigation
- Fixed sidebar navigation
- Active page highlighting
- Emoji icons for visual appeal
- Clean, minimalist design

---

## 🔧 Technical Features

### Frontend (React)
```
✅ React 18 with Hooks
✅ React Router v6 for navigation
✅ Context API for state management
✅ Recharts for data visualization
✅ Responsive CSS design
✅ Component-based architecture
```

### Backend (Django)
```
✅ Django 4.2
✅ Django REST Framework
✅ SQLite database (dev)
✅ CORS headers configured
✅ Admin panel
✅ API browsable interface
```

### State Management
```javascript
// Available in FinanceContext:
- expenses (array)
- income (array)
- budgets (array)
- addExpense()
- deleteExpense()
- addIncome()
- deleteIncome()
- addBudget()
- updateBudget()
- deleteBudget()
- totalIncome (calculated)
- totalExpenses (calculated)
- balance (calculated)
```

---

## 📊 Mock Data Examples

### Sample Expense
```javascript
{
  id: 1,
  description: 'Grocery Shopping',
  amount: 150.50,
  category: 'Food',
  date: '2025-12-10',
  type: 'expense'
}
```

### Sample Income
```javascript
{
  id: 1,
  source: 'Salary',
  amount: 5000.00,
  date: '2025-12-01',
  type: 'income'
}
```

### Sample Budget
```javascript
{
  id: 1,
  category: 'Food',
  limit: 500,
  spent: 225.75,
  color: '#e74c3c'
}
```

---

## 🎯 User Workflows

### Adding an Expense
1. Navigate to Expenses page
2. Click "+ Add Expense"
3. Fill in description, amount, category, date
4. Click "Add Expense"
5. See it appear in the table
6. Budget automatically updates

### Setting a Budget
1. Go to Budget page
2. Click "+ Add Budget"
3. Enter category name and limit amount
4. Click "Create Budget"
5. See budget card with progress bar
6. Monitor spending automatically

### Viewing Analytics
1. Navigate to Analytics page
2. See key metrics at top
3. Review pie chart for expense distribution
4. Check bar chart for category comparison
5. View monthly trends
6. Review top 5 expenses

---

## 🚀 Performance Features

- Lazy loading of charts
- Efficient re-renders with React hooks
- Memoized calculations
- Optimized CSS
- Fast state updates
- Responsive design (mobile-friendly)

---

## 📱 Responsive Design

### Desktop (1200px+)
- Full sidebar navigation
- Multi-column grids
- Large charts
- Spacious layout

### Tablet (768px - 1199px)
- Adjusted sidebar width
- 2-column grids
- Medium charts
- Optimized spacing

### Mobile (< 768px)
- Compact sidebar
- Single column layout
- Stacked cards
- Touch-friendly buttons
- Scrollable tables

---

## 🎓 Learning Points

This project demonstrates:
- React component architecture
- State management with Context API
- REST API design
- Django models and serializers
- CORS configuration
- Full-stack integration
- Responsive web design
- Data visualization
- CRUD operations
- Calculated fields

---

## 💡 Customization Ideas

Want to extend the app? Try:
- Add user authentication
- Multi-currency support
- Export to CSV/PDF
- Recurring expenses/income
- Email notifications
- Mobile app version
- Dark mode theme
- Custom categories
- Financial goals tracking
- Receipt uploads

---

**Ready to explore?** Start with the Dashboard to see everything at a glance! 🚀
