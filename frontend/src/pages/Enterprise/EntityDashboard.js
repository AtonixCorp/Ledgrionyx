import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

  const COLORS = ['var(--color-error)', 'var(--color-cyan)', 'var(--color-cyan-dark)', 'var(--color-warning)', 'var(--color-success)'];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Standalone topbar */}
      <div style={{
        height: 60, background: '#003B73', display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 6, color: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500,
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span> Back
        </button>
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>ATC Capital</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{entity.name}</span>
        <div style={{ flex: 1 }} />
        <span style={{
          background: entity.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
          color: entity.status === 'active' ? '#6EE7B7' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${entity.status === 'active' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
        }}>{entity.status}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{entity.country} &bull; {entity.entity_type}</span>
      </div>

      {/* Page header section */}
      <div style={{ padding: '28px 32px', borderBottom: '1px solid #E5E7EB', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{entity.name}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>📍 {entity.country}</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>•</span>
            <span style={{ fontSize: 13, color: '#6B7280', textTransform: 'capitalize' }}>{entity.entity_type}</span>
            <span style={{
              background: entity.status === 'active' ? '#D1FAE5' : '#F3F4F6',
              color: entity.status === 'active' ? '#065F46' : '#374151',
              borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600,
            }}>{entity.status}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', background: '#fff',
        padding: '0 32px', position: 'sticky', top: 60, zIndex: 50,
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'expenses', label: `Expenses (${expenses.length})` },
          { key: 'income', label: `Income (${income.length})` },
          { key: 'budgets', label: `Budgets (${budgets.length})` },
          { key: 'staff', label: `Staff & HR (${staff.length})` },
          { key: 'structure', label: 'Company Structure' },
          { key: 'financial', label: 'Financial Tracking' },
          { key: 'bookkeeping', label: 'Bookkeeping' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? '#003B73' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#6B7280',
              border: 'none', padding: '14px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', borderBottom: activeTab === tab.key ? '2px solid #003B73' : 'none',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { if (activeTab !== tab.key) e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseOut={e => { if (activeTab !== tab.key) e.currentTarget.style.background = 'transparent'; }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Financial Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 32 }}>
            <div style={{
              background: '#fff', borderRadius: 10, padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #0284C7',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Total Income</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 4 }}>${totalIncome.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{income.length} transactions</div>
            </div>
            <div style={{
              background: '#fff', borderRadius: 10, padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #DC2626',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Total Expenses</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 4 }}>${totalExpenses.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{expenses.length} transactions</div>
            </div>
            <div style={{
              background: '#fff', borderRadius: 10, padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${netIncome >= 0 ? '#10B981' : '#DC2626'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Net Income</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: netIncome >= 0 ? '#10B981' : '#DC2626', marginBottom: 4 }}>${netIncome.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}% margin</div>
            </div>
          </div>

          {/* Quick Access Cards Grid */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Quick Access</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
              {[
                { label: 'Expenses', icon: '📊', count: expenses.length, action: () => navigate(`/enterprise/entity/${entityId}/expenses`) },
                { label: 'Income', icon: '💰', count: income.length, action: () => navigate(`/enterprise/entity/${entityId}/income`) },
                { label: 'Budgets', icon: '📈', count: budgets.length, action: () => navigate(`/enterprise/entity/${entityId}/budgets`) },
                { label: 'Bookkeeping', icon: '📚', action: () => navigate(`/enterprise/entity/${entityId}/bookkeeping`) },
                { label: 'Cashflow', icon: '💳', action: () => navigate(`/enterprise/entity/${entityId}/cashflow-treasury`) },
                { label: 'Staff & HR', icon: '👥', count: staff.length, action: () => setActiveTab('staff') },
                { label: 'Chart of Accounts', icon: '📋', action: () => navigate(`/enterprise/entity/${entityId}/chart-of-accounts`) },
                { label: 'General Ledger', icon: '📑', action: () => navigate(`/enterprise/entity/${entityId}/general-ledger`) },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  style={{
                    background: '#fff', borderRadius: 10, padding: '16px', cursor: 'pointer',
                    border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = '#003B73';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                  {item.count !== undefined && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{item.count} {item.label.toLowerCase()}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, margin: '0 0 16px' }}>Expense Categories</h3>
              {expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                      {expenseCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No expense data available</div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, margin: '0 0 16px' }}>Budget vs Actual</h3>
              {budgetComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={budgetComparison}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="category" /><YAxis /><Tooltip formatter={(value) => `$${value.toFixed(2)}`} /><Legend /><Bar dataKey="budget" fill="#10B981" name="Budget" /><Bar dataKey="spent" fill="#DC2626" name="Spent" /></BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No budget data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Expense Management</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Track and manage all business expenses</p>
            </div>
            <button onClick={() => navigate(`/enterprise/entity/${entityId}/expenses`)} style={{ background: '#003B73', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open Manager →</button>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 10).map((exp, i) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                    <td style={{ padding: '11px 16px', color: '#6B7280', fontSize: 12 }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 16px', color: '#111827' }}>{exp.description}</td>
                    <td style={{ padding: '11px 16px', color: '#6B7280' }}>{exp.category}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>-${parseFloat(exp.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>No expenses recorded</div>}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Income Management</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Track revenue streams and analyze income sources</p>
            </div>
            <button onClick={() => navigate(`/enterprise/entity/${entityId}/income`)} style={{ background: '#003B73', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open Manager →</button>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Source</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {income.slice(0, 10).map((inc, i) => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                    <td style={{ padding: '11px 16px', color: '#6B7280', fontSize: 12 }}>{new Date(inc.date).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 16px', color: '#111827' }}>{inc.source}</td>
                    <td style={{ padding: '11px 16px', color: '#6B7280' }}>{inc.income_type}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 600, color: '#10B981' }}>${parseFloat(inc.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {income.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>No income recorded</div>}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Budget Management</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Set spending limits and monitor utilization</p>
            </div>
            <button onClick={() => navigate(`/enterprise/entity/${entityId}/budgets`)} style={{ background: '#003B73', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open Manager →</button>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Budget Limit</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Spent</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Remaining</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget, i) => {
                  const spent = expenses.filter(exp => exp.category === budget.category).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                  const remaining = parseFloat(budget.limit) - spent;
                  return (
                    <tr key={budget.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111827' }}>{budget.category}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', color: '#6B7280' }}>${parseFloat(budget.limit).toFixed(2)}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', color: '#6B7280' }}>${spent.toFixed(2)}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 600, color: remaining >= 0 ? '#10B981' : '#DC2626' }}>${remaining.toFixed(2)}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: remaining >= 0 ? '#D1FAE5' : '#FEE2E2',
                          color: remaining >= 0 ? '#065F46' : '#DC2626',
                          borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                        }}>{remaining >= 0 ? 'Under' : 'Over'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {budgets.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>No budgets set</div>}
          </div>
        </div>
      )}

      {/* Staff & HR Tab */}
      {activeTab === 'staff' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Staff & HR</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, marginBottom: 28 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Departments ({departments.length})</h4>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {departments.map(dept => (
                  <div key={dept.id} style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{dept.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{dept.staff_count} staff</div>
                  </div>
                ))}
                {departments.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>No departments</div>}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Roles ({roles.length})</h4>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {roles.map(role => (
                  <div key={role.id} style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{role.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{role.staff_count} staff</div>
                  </div>
                ))}
                {roles.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>No roles</div>}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Quick Stats</h4>
              <div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Total Staff</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{staff.length}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Active</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{staff.filter(s => s.status === 'active').length}</span>
                </div>
                <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Avg Salary</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>${(staff.filter(s => s.status === 'active').reduce((sum, s) => sum + (parseFloat(s.salary) || 0), 0) / Math.max(staff.filter(s => s.status === 'active').length, 1)).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Department</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.slice(0, 10).map((member, i) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 500, color: '#111827' }}>{member.full_name}</td>
                    <td style={{ padding: '11px 16px', color: '#6B7280' }}>{member.role_name}</td>
                    <td style={{ padding: '11px 16px', color: '#6B7280' }}>{member.department_name}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <span style={{
                        background: member.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                        color: member.status === 'active' ? '#065F46' : '#374151',
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                      }}>{member.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staff.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>No staff added</div>}
          </div>
        </div>
      )}

      {/* Structure Tab - simplified */}
      {activeTab === 'structure' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Company Structure</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Bank Accounts ({bankAccounts.length})</h4>
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {bankAccounts.map(account => (
                  <div key={account.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{account.account_name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{account.bank_name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#003B73', marginTop: 4 }}>${account.balance.toFixed(2)}</div>
                  </div>
                ))}
                {bankAccounts.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>No bank accounts</div>}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Wallets ({wallets.length})</h4>
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {wallets.map(wallet => (
                  <div key={wallet.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{wallet.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{wallet.get_wallet_type_display}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#003B73', marginTop: 4 }}>${wallet.balance.toFixed(2)}</div>
                  </div>
                ))}
                {wallets.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>No wallets</div>}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Compliance Docs ({complianceDocuments.length})</h4>
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {complianceDocuments.map(doc => (
                  <div key={doc.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6', opacity: doc.is_expiring_soon ? 1 : 0.8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: doc.days_until_expiry <= 30 ? '#DC2626' : '#6B7280', marginTop: 2 }}>
                      Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                    </div>
                    {doc.days_until_expiry !== null && doc.days_until_expiry <= 30 && (
                      <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 4 }}>⚠️ {doc.days_until_expiry} days left</div>
                    )}
                  </div>
                ))}
                {complianceDocuments.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>No documents</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tracking Tab */}
      {activeTab === 'financial' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Financial Tracking</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>P&L Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Total Revenue</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>${totalIncome.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Total Expenses</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>-${totalExpenses.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Net Income</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: netIncome >= 0 ? '#10B981' : '#DC2626' }}>${netIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Cash Position</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Bank Accounts</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#003B73' }}>${bankAccounts.reduce((s, a) => s + parseFloat(a.balance), 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Wallets</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#003B73' }}>${wallets.reduce((s, w) => s + parseFloat(w.balance), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookkeeping Tab */}
      {activeTab === 'bookkeeping' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Bookkeeping Module</h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>Manage financial transactions, chart of accounts, and reporting.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
              <button onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping`)} style={{ background: '#003B73', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Dashboard</button>
              <button onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/transactions`)} style={{ background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: 7, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Transactions</button>
              <button onClick={() => navigate(`/enterprise/entity/${entityId}/chart-of-accounts`)} style={{ background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: 7, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Chart of Accounts</button>
              <button onClick={() => navigate(`/enterprise/entity/${entityId}/general-ledger`)} style={{ background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: 7, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>General Ledger</button>
            </div>
          </div>
          <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '16px 20px', color: '#78350F', fontSize: 13 }}>
            <strong>Note:</strong> Click on any button above to access the full bookkeeping module with detailed transaction management and reporting tools.
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default EntityDashboard;
