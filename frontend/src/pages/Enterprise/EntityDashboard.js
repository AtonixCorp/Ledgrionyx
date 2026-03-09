import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaGlobe } from 'react-icons/fa';

const EntityDashboard = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const enterpriseContext = useEnterprise();
  
  // Safely destructure with fallbacks
  const {
    entities = [],
    fetchEntityExpenses,
    fetchEntityIncome,
    fetchEntityBudgets,
    fetchEntityDepartments,
    fetchEntityRoles,
    fetchEntityStaff,
    fetchEntityBankAccounts,
    fetchEntityWallets,
    fetchEntityComplianceDocuments,
    hasPermission,
    PERMISSIONS
  } = enterpriseContext || {};

  const [entity, setEntity] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [complianceDocuments, setComplianceDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadEntityData = async () => {
      try {
        if (!entityId) {
          setLoading(false);
          return;
        }

        // Find entity
        const foundEntity = entities.find(e => e.id.toString() === entityId);
        if (!foundEntity) {
          setLoading(false);
          return;
        }

        setEntity(foundEntity);
        setLoading(false);

        // Load data asynchronously without blocking render
        setTimeout(async () => {
          try {
            // Load entity-specific financial data with timeout
            const financialPromise = Promise.race([
              Promise.all([
                fetchEntityExpenses(entityId),
                fetchEntityIncome(entityId),
                fetchEntityBudgets(entityId)
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);

            const [entityExpenses, entityIncome, entityBudgets] = await financialPromise;
            setExpenses(entityExpenses || []);
            setIncome(entityIncome || []);
            setBudgets(entityBudgets || []);

            // Load entity management data with timeout
            const managementPromise = Promise.race([
              Promise.all([
                fetchEntityDepartments(entityId),
                fetchEntityRoles(entityId),
                fetchEntityStaff(entityId),
                fetchEntityBankAccounts(entityId),
                fetchEntityWallets(entityId),
                fetchEntityComplianceDocuments(entityId)
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);

            const [entityDepartments, entityRoles, entityStaff, entityBankAccounts, entityWallets, entityComplianceDocs] = await managementPromise;
            setDepartments(entityDepartments || []);
            setRoles(entityRoles || []);
            setStaff(entityStaff || []);
            setBankAccounts(entityBankAccounts || []);
            setWallets(entityWallets || []);
            setComplianceDocuments(entityComplianceDocs || []);
          } catch (err) {
            console.error('Failed to load entity data:', err);
            // Set empty arrays as fallback
            setExpenses([]);
            setIncome([]);
            setBudgets([]);
            setDepartments([]);
            setRoles([]);
            setStaff([]);
            setBankAccounts([]);
            setWallets([]);
            setComplianceDocuments([]);
          }
        }, 0);
      } catch (err) {
        console.error('Error in loadEntityData:', err);
        setLoading(false);
      }
    };

    loadEntityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  // Check if context is loaded
  if (!hasPermission || !PERMISSIONS) {
    return <div className="loading">Loading...</div>;
  }

  if (!hasPermission(PERMISSIONS.VIEW_ENTITIES)) {
    return <div className="permission-denied">You don't have permission to view entity dashboards.</div>;
  }

  if (loading) {
    return <div className="loading">Loading entity dashboard...</div>;
  }

  if (!entity) {
    return <div className="error">Entity not found.</div>;
  }

  // Calculate financial metrics
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const netIncome = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expenseCategories = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.category === exp.category);
    if (existing) {
      existing.amount += parseFloat(exp.amount);
    } else {
      acc.push({ category: exp.category, amount: parseFloat(exp.amount) });
    }
    return acc;
  }, []);

  // Budget comparison
  const budgetComparison = budgets.map(budget => {
    const spent = expenses
      .filter(exp => exp.category === budget.category)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    return {
      category: budget.category,
      budget: parseFloat(budget.limit),
      spent: spent,
      remaining: parseFloat(budget.limit) - spent
    };
  });

  const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71'];

  return (
    <div className="entity-dashboard">
      <div className="dashboard-header">
        <div className="entity-info">
          <h1>{entity.name}</h1>
          <div className="entity-meta">
            <span className="country"><FaGlobe /> {entity.country}</span>
            <span className="type">{entity.entity_type}</span>
            <span className={`status ${entity.status}`}>{entity.status}</span>
          </div>
        </div>
        <button className="btn-back" onClick={() => navigate('/app/enterprise/entities')}>
          ← Back to Entities
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expenses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income ({income.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          Budgets ({budgets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff & HR ({staff.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveTab('structure')}
        >
          Company Structure
        </button>
        <button
          className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Tracking
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookkeeping' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookkeeping')}
        >
          📚 Bookkeeping
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Quick Access Cards */}
          <div className="quick-access-section">
            <h3>Quick Access</h3>
            <div className="quick-access-grid">
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/expenses`)}>
                <div className="card-icon expenses">💸</div>
                <h4>Expenses</h4>
                <p>{expenses.length} transactions</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/income`)}>
                <div className="card-icon income">💰</div>
                <h4>Income</h4>
                <p>{income.length} records</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/budgets`)}>
                <div className="card-icon budgets">📊</div>
                <h4>Budgets</h4>
                <p>{budgets.length} budgets</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping`)}>
                <div className="card-icon bookkeeping">📚</div>
                <h4>Bookkeeping</h4>
                <p>Full accounting</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/cashflow-treasury`)}>
                <div className="card-icon treasury">💰</div>
                <h4>Cashflow & Treasury</h4>
                <p>Real-time visibility</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => setActiveTab('staff')}>
                <div className="card-icon staff">👥</div>
                <h4>Staff & HR</h4>
                <p>{staff.length} members</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => setActiveTab('structure')}>
                <div className="card-icon structure">🏢</div>
                <h4>Structure</h4>
                <p>Accounts & docs</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/chart-of-accounts`)}>
                <div className="card-icon" style={{ background: '#ebf4ff', color: '#3182ce' }}>📋</div>
                <h4>Chart of Accounts</h4>
                <p>COA & account codes</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/general-ledger`)}>
                <div className="card-icon" style={{ background: '#e9d8fd', color: '#6b46c1' }}>📒</div>
                <h4>General Ledger</h4>
                <p>All posted entries</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/journal-entries`)}>
                <div className="card-icon" style={{ background: '#fefcbf', color: '#d69e2e' }}>✏️</div>
                <h4>Journal Entries</h4>
                <p>Debits & credits</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/accounts-receivable`)}>
                <div className="card-icon" style={{ background: '#c6f6d5', color: '#276749' }}>📥</div>
                <h4>Accounts Receivable</h4>
                <p>Customers & invoices</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/accounts-payable`)}>
                <div className="card-icon" style={{ background: '#fed7d7', color: '#9b2c2c' }}>📤</div>
                <h4>Accounts Payable</h4>
                <p>Vendors & bills</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/inventory`)}>
                <div className="card-icon" style={{ background: '#feebc8', color: '#c05621' }}>📦</div>
                <h4>Inventory</h4>
                <p>Items, COGS & movements</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bank-reconciliation`)}>
                <div className="card-icon" style={{ background: '#e6fffa', color: '#276749' }}>🏦</div>
                <h4>Bank Reconciliation</h4>
                <p>Match bank statements</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/revenue-recognition`)}>
                <div className="card-icon" style={{ background: '#e9d8fd', color: '#553c9a' }}>📈</div>
                <h4>Revenue Recognition</h4>
                <p>Deferred & scheduled</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/period-close`)}>
                <div className="card-icon" style={{ background: '#fed7d7', color: '#c53030' }}>🔒</div>
                <h4>Period Close</h4>
                <p>Close ledger periods</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/fx-accounting`)}>
                <div className="card-icon" style={{ background: '#bee3f8', color: '#2b6cb0' }}>🌐</div>
                <h4>FX Accounting</h4>
                <p>Exchange rates & FX P&L</p>
                <span className="card-arrow">→</span>
              </div>
              <div className="quick-access-card" onClick={() => navigate(`/enterprise/entity/${entityId}/notifications`)}>
                <div className="card-icon" style={{ background: '#fefcbf', color: '#d69e2e' }}>🔔</div>
                <h4>Notifications</h4>
                <p>Alerts & preferences</p>
                <span className="card-arrow">→</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card income">
              <h3>Total Income</h3>
              <p className="amount">${totalIncome.toFixed(2)}</p>
              <p className="subtitle">{income.length} transactions</p>
            </div>
            <div className="summary-card expenses">
              <h3>Total Expenses</h3>
              <p className="amount">${totalExpenses.toFixed(2)}</p>
              <p className="subtitle">{expenses.length} transactions</p>
            </div>
            <div className={`summary-card net ${netIncome >= 0 ? 'positive' : 'negative'}`}>
              <h3>Net Income</h3>
              <p className="amount">${netIncome.toFixed(2)}</p>
              <p className="subtitle">{((netIncome / totalIncome) * 100).toFixed(1)}% margin</p>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Expense Categories */}
            <div className="chart-card">
              <h3>Expense Categories</h3>
              {expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">No expense data available</p>
              )}
            </div>

            {/* Budget vs Actual */}
            <div className="chart-card">
              <h3>Budget vs Actual</h3>
              {budgetComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#2ecc71" name="Budget" />
                    <Bar dataKey="spent" fill="#e74c3c" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">No budget data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="tab-content">
          <div className="management-nav-section">
            <div className="section-header">
              <h3>Expense Management</h3>
              <p>Track and manage all business expenses with detailed categorization</p>
            </div>
            <button 
              className="manage-btn"
              onClick={() => navigate(`/enterprise/entity/${entityId}/expenses`)}
            >
              Open Expense Manager
            </button>
          </div>
          
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 10).map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td className="amount negative">${parseFloat(expense.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && <p className="no-data">No expenses recorded for this entity</p>}
            {expenses.length > 10 && (
              <div className="table-footer">
                <p>
                  Showing 10 of {expenses.length} expenses.{' '}
                  <a
                    href={`/enterprise/entity/${entityId}/expenses`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/enterprise/entity/${entityId}/expenses`);
                    }}
                  >
                    View all →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="tab-content">
          <div className="management-nav-section">
            <div className="section-header">
              <h3>Income Management</h3>
              <p>Track revenue streams and analyze income sources</p>
            </div>
            <button 
              className="manage-btn"
              onClick={() => navigate(`/enterprise/entity/${entityId}/income`)}
            >
              Open Income Manager
            </button>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {income.slice(0, 10).map(inc => (
                  <tr key={inc.id}>
                    <td>{new Date(inc.date).toLocaleDateString()}</td>
                    <td>{inc.source}</td>
                    <td>{inc.income_type}</td>
                    <td className="amount positive">${parseFloat(inc.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {income.length === 0 && <p className="no-data">No income recorded for this entity</p>}
            {income.length > 10 && (
              <div className="table-footer">
                <p>
                  Showing 10 of {income.length} income records.{' '}
                  <a
                    href={`/enterprise/entity/${entityId}/income`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/enterprise/entity/${entityId}/income`);
                    }}
                  >
                    View all →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="tab-content">
          <div className="management-nav-section">
            <div className="section-header">
              <h3>Budget Management</h3>
              <p>Set spending limits and monitor budget utilization across categories</p>
            </div>
            <button 
              className="manage-btn"
              onClick={() => navigate(`/enterprise/entity/${entityId}/budgets`)}
            >
              Open Budget Manager
            </button>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget Limit</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(budget => {
                  const spent = expenses
                    .filter(exp => exp.category === budget.category)
                    .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                  const remaining = parseFloat(budget.limit) - spent;
                  const status = remaining >= 0 ? 'under' : 'over';

                  return (
                    <tr key={budget.id}>
                      <td>{budget.category}</td>
                      <td>${parseFloat(budget.limit).toFixed(2)}</td>
                      <td>${spent.toFixed(2)}</td>
                      <td className={remaining >= 0 ? 'positive' : 'negative'}>
                        ${remaining.toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${status}`}>
                          {status === 'under' ? '✅ Under' : '⚠️ Over'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {budgets.length === 0 && <p className="no-data">No budgets set for this entity</p>}
          </div>
        </div>
      )}

      {/* Staff & HR Tab */}
      {activeTab === 'staff' && (
        <div className="tab-content">
          <div className="staff-grid">
            {/* Departments Section */}
            <div className="staff-section">
              <h3>Departments ({departments.length})</h3>
              <div className="departments-list">
                {departments.map(dept => (
                  <div key={dept.id} className="department-card">
                    <h4>{dept.name}</h4>
                    <p>{dept.description}</p>
                    <div className="dept-stats">
                      <span>{dept.staff_count} staff</span>
                      {dept.budget && <span>Budget: ${dept.budget}</span>}
                    </div>
                  </div>
                ))}
                {departments.length === 0 && <p className="no-data">No departments created</p>}
              </div>
            </div>

            {/* Roles Section */}
            <div className="staff-section">
              <h3>Roles ({roles.length})</h3>
              <div className="roles-list">
                {roles.map(role => (
                  <div key={role.id} className="role-card">
                    <h4>{role.name}</h4>
                    <p>{role.description}</p>
                    <div className="role-stats">
                      <span>{role.staff_count} staff</span>
                      {role.department_name && <span>{role.department_name}</span>}
                    </div>
                  </div>
                ))}
                {roles.length === 0 && <p className="no-data">No roles defined</p>}
              </div>
            </div>

            {/* Staff Section */}
            <div className="staff-section">
              <h3>Staff Directory</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Hire Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(member => (
                      <tr key={member.id}>
                        <td>{member.full_name}</td>
                        <td>{member.role_name}</td>
                        <td>{member.department_name}</td>
                        <td>
                          <span className={`status-badge ${member.status}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>{new Date(member.hire_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {staff.length === 0 && <p className="no-data">No staff members added</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Structure Tab */}
      {activeTab === 'structure' && (
        <div className="tab-content">
          <div className="structure-grid">
            {/* Bank Accounts Section */}
            <div className="structure-section">
              <h3>Bank Accounts ({bankAccounts.length})</h3>
              <div className="accounts-list">
                {bankAccounts.map(account => (
                  <div key={account.id} className="account-card">
                    <h4>{account.account_name}</h4>
                    <p>{account.bank_name} - {account.account_type}</p>
                    <div className="account-balance">
                      <span className="balance">${account.balance.toFixed(2)}</span>
                      <span className="currency">{account.currency}</span>
                    </div>
                  </div>
                ))}
                {bankAccounts.length === 0 && <p className="no-data">No bank accounts added</p>}
              </div>
            </div>

            {/* Wallets Section */}
            <div className="structure-section">
              <h3>Wallets ({wallets.length})</h3>
              <div className="wallets-list">
                {wallets.map(wallet => (
                  <div key={wallet.id} className="wallet-card">
                    <h4>{wallet.name}</h4>
                    <p>{wallet.get_wallet_type_display} - {wallet.provider || 'N/A'}</p>
                    <div className="wallet-balance">
                      <span className="balance">${wallet.balance.toFixed(2)}</span>
                      <span className="currency">{wallet.currency}</span>
                    </div>
                  </div>
                ))}
                {wallets.length === 0 && <p className="no-data">No wallets added</p>}
              </div>
            </div>

            {/* Compliance Documents Section */}
            <div className="structure-section">
              <h3>Compliance Documents ({complianceDocuments.length})</h3>
              <div className="documents-list">
                {complianceDocuments.map(doc => (
                  <div key={doc.id} className={`document-card ${doc.is_expiring_soon ? 'expiring' : ''}`}>
                    <h4>{doc.title}</h4>
                    <p>{doc.document_type} - {doc.issuing_authority}</p>
                    <div className="document-dates">
                      <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                      {doc.days_until_expiry !== null && (
                        <span className={doc.days_until_expiry <= 30 ? 'urgent' : ''}>
                          {doc.days_until_expiry} days left
                        </span>
                      )}
                    </div>
                    <span className={`status-badge ${doc.status}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
                {complianceDocuments.length === 0 && <p className="no-data">No compliance documents added</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tracking Tab */}
      {activeTab === 'financial' && (
        <div className="tab-content">
          <div className="financial-grid">
            {/* Profit & Loss Summary */}
            <div className="financial-section">
              <h3>Profit & Loss Summary</h3>
              <div className="pnl-cards">
                <div className="pnl-card">
                  <h4>Total Revenue</h4>
                  <p className="amount positive">${totalIncome.toFixed(2)}</p>
                </div>
                <div className="pnl-card">
                  <h4>Total Expenses</h4>
                  <p className="amount negative">${totalExpenses.toFixed(2)}</p>
                </div>
                <div className={`pnl-card ${netIncome >= 0 ? 'profit' : 'loss'}`}>
                  <h4>Net Profit/Loss</h4>
                  <p className="amount">${netIncome.toFixed(2)}</p>
                </div>
                <div className="pnl-card">
                  <h4>Profit Margin</h4>
                  <p className="percentage">
                    {totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Cash Position */}
            <div className="financial-section">
              <h3>Cash Position</h3>
              <div className="cash-position">
                <div className="cash-accounts">
                  <h4>Bank Accounts</h4>
                  {bankAccounts.map(account => (
                    <div key={account.id} className="cash-item">
                      <span>{account.account_name}</span>
                      <span className="amount">${account.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="cash-accounts">
                  <h4>Wallets</h4>
                  {wallets.map(wallet => (
                    <div key={wallet.id} className="cash-item">
                      <span>{wallet.name}</span>
                      <span className="amount">${wallet.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="total-cash">
                  <h4>Total Cash Position</h4>
                  <p className="amount large">
                    ${(bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) + 
                       wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="financial-section">
              <h3>Monthly Summary</h3>
              <div className="monthly-summary">
                <div className="summary-item">
                  <span>Average Monthly Income</span>
                  <span className="amount">${(totalIncome / 12).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Average Monthly Expenses</span>
                  <span className="amount">${(totalExpenses / 12).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Staff Payroll Total</span>
                  <span className="amount">
                    ${staff.filter(s => s.status === 'active').reduce((sum, s) => sum + (parseFloat(s.salary) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookkeeping Tab */}
      {activeTab === 'bookkeeping' && (
        <div className="tab-content">
          <div className="bookkeeping-section">
            <div className="section-info">
              <h3>📚 Bookkeeping Module</h3>
              <p>Track all financial transactions, manage accounts, categories, and generate reports.</p>
              <button
                className="setup-btn"
                onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping`)}
              >
                Open Bookkeeping Dashboard
              </button>
            </div>

            <div className="features-grid">
              <div
                className="feature-card clickable"
                onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/transactions`)}
              >
                <div className="feature-icon">💰</div>
                <h4>Transaction Management</h4>
                <p>Record income and expenses with detailed categorization</p>
                <div className="feature-action">
                  <span>Manage Transactions</span>
                  <span className="arrow">→</span>
                </div>
              </div>
              <div
                className="feature-card clickable"
                onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping`)}
              >
                <div className="feature-icon">📊</div>
                <h4>Financial Reports</h4>
                <p>P&L statements, cashflow, and category breakdowns</p>
                <div className="feature-action">
                  <span>View Reports</span>
                  <span className="arrow">→</span>
                </div>
              </div>
              <div
                className="feature-card clickable"
                onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/accounts`)}
              >
                <div className="feature-icon">🏦</div>
                <h4>Account Tracking</h4>
                <p>Monitor bank accounts, wallets, and cash balances</p>
                <div className="feature-action">
                  <span>Manage Accounts</span>
                  <span className="arrow">→</span>
                </div>
              </div>
              <div
                className="feature-card clickable"
                onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/categories`)}
              >
                <div className="feature-icon">📝</div>
                <h4>Categories & Audit</h4>
                <p>Manage categories and view audit logs</p>
                <div className="feature-action">
                  <span>View Details</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityDashboard;