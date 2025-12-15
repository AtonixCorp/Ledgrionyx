import React, { createContext, useState, useContext, useEffect } from 'react';
import calculationEngine from '../services/calculation/calculationEngine';
import validationService from '../services/calculation/validationService';
import monthlyAnalysisService from '../services/calculation/monthlyAnalysisService';
import taxCalculatorService from '../services/taxCalculatorService';

const FinanceContext = createContext();

// Mock data for demonstration
const initialExpenses = [
  { id: 1, description: 'Grocery Shopping', amount: 150.50, category: 'Food', date: '2025-12-10', type: 'expense' },
  { id: 2, description: 'Electric Bill', amount: 85.00, category: 'Utilities', date: '2025-12-08', type: 'expense' },
  { id: 3, description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2025-12-05', type: 'expense' },
  { id: 4, description: 'Gas Station', amount: 45.00, category: 'Transportation', date: '2025-12-12', type: 'expense' },
  { id: 5, description: 'Restaurant Dinner', amount: 75.25, category: 'Food', date: '2025-12-14', type: 'expense' },
  { id: 6, description: 'Gym Membership', amount: 50.00, category: 'Health', date: '2025-12-01', type: 'expense' },
];

const initialIncome = [
  { id: 1, source: 'Salary', amount: 5000.00, date: '2025-12-01', type: 'income' },
  { id: 2, source: 'Freelance Project', amount: 1200.00, date: '2025-12-10', type: 'income' },
  { id: 3, source: 'Investment Returns', amount: 300.00, date: '2025-12-05', type: 'income' },
];

const initialBudgets = [
  { id: 1, category: 'Food', limit: 500, spent: 225.75, color: '#e74c3c' },
  { id: 2, category: 'Transportation', limit: 200, spent: 45, color: '#3498db' },
  { id: 3, category: 'Entertainment', limit: 150, spent: 15.99, color: '#9b59b6' },
  { id: 4, category: 'Utilities', limit: 300, spent: 85, color: '#f39c12' },
  { id: 5, category: 'Health', limit: 200, spent: 50, color: '#2ecc71' },
];

// Mock portfolio for AI analysis
const mockPortfolio = [
  { id: 1, name: 'Bitcoin', type: 'crypto', value: 5000, volatility: 'high' },
  { id: 2, name: 'Ethereum', type: 'crypto', value: 3000, volatility: 'high' },
  { id: 3, name: 'Apple Stock', type: 'stock', value: 8000, volatility: 'moderate' },
  { id: 4, name: 'Tesla Stock', type: 'stock', value: 6000, volatility: 'high' },
  { id: 5, name: 'S&P 500 ETF', type: 'stock', value: 10000, volatility: 'low' },
  { id: 6, name: 'US Treasury Bonds', type: 'bond', value: 15000, volatility: 'low' },
  { id: 7, name: 'Real Estate Fund', type: 'real-estate', value: 12000, volatility: 'low' },
  { id: 8, name: 'Gold ETF', type: 'commodity', value: 4000, volatility: 'moderate' },
];

export const FinanceProvider = ({ children }) => {
  // Core Data States
  const [expenses, setExpenses] = useState(initialExpenses);
  const [income, setIncome] = useState(initialIncome);
  const [budgets, setBudgets] = useState(initialBudgets);
  
  // User Settings
  const [userCountry, setUserCountry] = useState('United States');
  const [userTaxRate, setUserTaxRate] = useState(21); // Default corporate tax
  
  // Monthly Tracking
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const current = monthlyAnalysisService.getCurrentMonth();
    return { year: current.year, month: current.month };
  });
  const [availableMonths, setAvailableMonths] = useState([]);
  
  // Calculated States (auto-updated by engine)
  const [financialSummary, setFinancialSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  
  // Recalculate everything when data changes
  useEffect(() => {
    recalculateAll();
    updateAvailableMonths();
  }, [expenses, income, budgets, userCountry, userTaxRate, selectedMonth.year, selectedMonth.month]);

  // ==================== CALCULATION ENGINE ====================
  
  /**
   * Master recalculation function
   * Called automatically when any financial data changes
   */
  const recalculateAll = () => {
    // Get tax info for user's country
    const taxInfo = taxCalculatorService.getTaxInfo(userCountry);
    const effectiveTaxRate = userTaxRate || (taxInfo ? taxInfo.rate : 0);
    
    // Transform income data to match calculator format
    const transformedIncome = income.map(item => ({
      amount: parseFloat(item.amount || 0),
      category: item.source || 'Other',
      date: item.date
    }));
    
    // Calculate complete financial summary using engine
    const summary = calculationEngine.calculateFinancialSummary({
      incomes: transformedIncome,
      expenses: expenses,
      budgets: budgets,
      taxRate: effectiveTaxRate,
      country: userCountry
    });
    
    setFinancialSummary(summary);
    
    // Calculate monthly summary for selected month
    const monthly = monthlyAnalysisService.generateMonthlySummary({
      incomes: transformedIncome,
      expenses: expenses,
      budgets: budgets,
      year: selectedMonth.year,
      month: selectedMonth.month,
      taxRate: effectiveTaxRate,
      country: userCountry
    });
    
    setMonthlySummary(monthly);
    
    // Validate all data
    const validation = validationService.validateAllFinancialData({
      totalIncome: summary.income.gross,
      totalExpenses: summary.expenses.total,
      totalBudget: summary.budget.total,
      taxRate: effectiveTaxRate,
      country: userCountry,
      summary: summary
    });
    
    setValidationResults(validation);
    
    return summary;
  };
  
  /**
   * Update available months based on existing transactions
   */
  const updateAvailableMonths = () => {
    const months = new Set();
    
    // Get months from income
    income.forEach(item => {
      if (item.date) {
        const date = new Date(item.date);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
      }
    });
    
    // Get months from expenses
    expenses.forEach(item => {
      if (item.date) {
        const date = new Date(item.date);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
      }
    });
    
    // Convert to sorted array of {year, month} objects
    const monthsList = Array.from(months)
      .map(str => {
        const [year, month] = str.split('-');
        return { year: parseInt(year), month: parseInt(month) };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year; // Newest first
        return b.month - a.month;
      });
    
    // Always include current month
    const current = monthlyAnalysisService.getCurrentMonth();
    const currentExists = monthsList.some(m => m.year === current.year && m.month === current.month);
    if (!currentExists) {
      monthsList.unshift(current);
    }
    
    setAvailableMonths(monthsList);
  };
  
  /**
   * Change selected month
   */
  const changeMonth = (year, month) => {
    setSelectedMonth({ year, month });
  };
  
  // ==================== EXPENSES ====================
  
  const addExpense = (expense) => {
    // Validate expense first
    const validation = validationService.validateExpense(
      expense.amount,
      expense.category,
      budgets.find(b => b.category === expense.category)?.limit
    );
    
    if (!validation.isValid) {
      console.error('Expense validation failed:', validation.errors);
      // Still add but warn user
      if (validation.warnings.length > 0) {
        console.warn('Expense warnings:', validation.warnings);
      }
    }
    
    const newExpense = {
      ...expense,
      id: Date.now(),
      type: 'expense',
      category: expense.category || 'Other',
      date: expense.date || new Date().toISOString().split('T')[0],
      amount: calculationEngine.round(parseFloat(expense.amount || 0))
    };
    
    setExpenses([newExpense, ...expenses]);
    // Budget sync happens automatically via useEffect recalculation
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
    // Budget automatically updates via useEffect
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses(expenses.map(e => 
      e.id === id 
        ? { ...e, ...updatedExpense, amount: calculationEngine.round(parseFloat(updatedExpense.amount || e.amount)) }
        : e
    ));
  };

  // ==================== INCOME ====================
  
  const addIncome = (incomeItem) => {
    // Validate income first
    const validation = validationService.validateIncome(
      incomeItem.amount,
      incomeItem.source
    );
    
    if (!validation.isValid) {
      console.error('Income validation failed:', validation.errors);
    }
    
    const newIncome = {
      ...incomeItem,
      id: Date.now(),
      type: 'income',
      source: incomeItem.source || 'Other',
      date: incomeItem.date || new Date().toISOString().split('T')[0],
      amount: calculationEngine.round(parseFloat(incomeItem.amount || 0))
    };
    
    setIncome([newIncome, ...income]);
  };

  const deleteIncome = (id) => {
    setIncome(income.filter(i => i.id !== id));
  };

  const updateIncome = (id, updatedIncome) => {
    setIncome(income.map(i => 
      i.id === id 
        ? { ...i, ...updatedIncome, amount: calculationEngine.round(parseFloat(updatedIncome.amount || i.amount)) }
        : i
    ));
  };

  // ==================== BUDGETS ====================
  
  const addBudget = (budget) => {
    // Validate budget
    const validation = validationService.validateBudget(budget.amount || budget.limit);
    
    if (!validation.isValid) {
      console.error('Budget validation failed:', validation.errors);
    }
    
    const newBudget = {
      ...budget,
      id: Date.now(),
      amount: calculationEngine.round(parseFloat(budget.amount || budget.limit || 0)),
      limit: calculationEngine.round(parseFloat(budget.amount || budget.limit || 0)),
      category: budget.category || 'Other',
      spent: 0,
      color: budget.color || '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id, updates) => {
    setBudgets(budgets.map(b => 
      b.id === id 
        ? { 
            ...b, 
            ...updates, 
            amount: updates.amount ? calculationEngine.round(parseFloat(updates.amount)) : b.amount,
            limit: updates.limit ? calculationEngine.round(parseFloat(updates.limit)) : b.limit
          }
        : b
    ));
  };

  const deleteBudget = (id) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  // ==================== CALCULATIONS (from engine) ====================
  
  // These use the calculation engine instead of manual calculations
  const totalIncome = financialSummary ? financialSummary.income.gross : 
    calculationEngine.calculateTotalIncome(income.map(i => ({ amount: i.amount })));
  
  const totalExpenses = financialSummary ? financialSummary.expenses.total :
    calculationEngine.calculateTotalExpenses(expenses);
  
  const balance = financialSummary ? financialSummary.balance.net :
    calculationEngine.calculateNetBalance(totalIncome, totalExpenses);
  
  const netIncome = financialSummary ? financialSummary.income.net :
    calculationEngine.calculateNetIncome(totalIncome, userTaxRate);
  
  const taxAmount = financialSummary ? financialSummary.tax.amount :
    calculationEngine.calculateTax(totalIncome, userTaxRate);
  
  // ==================== TAX MANAGEMENT ====================
  
  const updateUserCountry = (country) => {
    setUserCountry(country);
    // Get tax rate for country
    const taxInfo = taxCalculatorService.getTaxInfo(country);
    if (taxInfo) {
      setUserTaxRate(taxInfo.rate); // Default to corporate rate
    }
  };
  
  const updateUserTaxRate = (rate) => {
    const validation = validationService.validateTaxRate(rate, userCountry);
    if (!validation.isValid) {
      console.error('Tax rate validation failed:', validation.errors);
      return false;
    }
    setUserTaxRate(calculationEngine.round(parseFloat(rate)));
    return true;
  };

  // Combine all transactions for AI analysis
  const transactions = [...expenses, ...income];

  const value = {
    // Data
    expenses,
    income,
    budgets,
    transactions,
    mockPortfolio,
    
    // CRUD Operations
    addExpense,
    deleteExpense,
    updateExpense,
    addIncome,
    deleteIncome,
    updateIncome,
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Calculated Values (from engine)
    totalIncome,
    totalExpenses,
    balance,
    netIncome,
    taxAmount,
    
    // Financial Summary (comprehensive)
    financialSummary,
    validationResults,
    
    // Monthly Tracking
    monthlySummary,
    selectedMonth,
    availableMonths,
    changeMonth,
    monthlyAnalysisService,
    
    // Tax & Country Settings
    userCountry,
    userTaxRate,
    updateUserCountry,
    updateUserTaxRate,
    
    // Calculation Engine (expose for components that need it)
    calculationEngine,
    validationService,
    
    // Manual recalculation trigger
    recalculateAll
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
