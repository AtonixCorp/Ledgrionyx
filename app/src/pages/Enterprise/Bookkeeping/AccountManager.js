import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useEnterprise } from '../../../context/EnterpriseContext';
import '../../../styles/EntityPages.css';

const AccountManager = () => {
  const { entityId } = useParams();
  const {
    fetchBookkeepingAccounts,
    createBookkeepingAccount,
    entities
  } = useEnterprise();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    currency: 'USD',
    account_number: '',
    description: '',
    balance: 0
  });

  const entity = entities.find(e => String(e.id) === String(entityId));

  const loadAccounts = useCallback(async () => {
    if (!entity?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchBookkeepingAccounts(entity.id);
    setAccounts(data.results || data);
    setLoading(false);
  }, [entity, fetchBookkeepingAccounts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (entity) {
      setFormData(prev => ({ ...prev, currency: entity.local_currency || 'USD' }));
    }
  }, [entity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createBookkeepingAccount({
        entity: entity.id,
        ...formData,
        is_active: true
      });
      alert('Account created successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        type: 'bank',
        currency: entity?.local_currency || 'USD',
        account_number: '',
        description: '',
        balance: 0
      });
      loadAccounts();
    } catch (err) {
      alert('Failed to create account: ' + err.message);
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'bank':
        return ;
      case 'wallet':
        return ;
      case 'cash':
        return ;
      default:
        return ;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="account-manager">
        <div className="loading">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="account-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Accounts</h1>
          <p>{entity?.name} • {accounts.length} accounts</p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            New Account
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="total-balance-card">
        <div className="balance-header">
          <h3>Total Balance</h3>
          <span className="account-count">{accounts.length} accounts</span>
        </div>
        <div className="balance-amount">
          {formatCurrency(totalBalance, entity?.local_currency)}
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="accounts-grid">
        {accounts.length > 0 ? (
          accounts.map(account => (
            <div key={account.id} className={`account-card ${account.type}`}>
              <div className="account-icon">
                {getAccountIcon(account.type)}
              </div>

              <div className="account-content">
                <div className="account-header">
                  <h4>{account.name}</h4>
                  <span className={`account-status ${account.is_active ? 'active' : 'inactive'}`}>

                  </span>
                </div>

                <div className="account-type-badge">
                  <span className="badge">{account.type}</span>
                  {account.account_number && (
                    <span className="account-number">••••{account.account_number.slice(-4)}</span>
                  )}
                </div>

                <div className="account-balance">
                  {formatCurrency(account.balance, account.currency)}
                </div>

                <div className="account-meta">
                  <span>{account.transaction_count || 0} transactions</span>
                  <span>{account.currency}</span>
                </div>

                {account.description && (
                  <p className="account-description">{account.description}</p>
                )}

                <div className="account-actions">
                  <button className="btn-icon" title="Edit account">

                  </button>
                  <button className="btn-icon btn-delete" title="Delete account">

                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">

            <h3>No Accounts Yet</h3>
            <p>Create your first account to start tracking transactions</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create Account
            </button>
          </div>
        )}
      </div>

      {/* Create Account Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Account</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GTBank Corporate Account"
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="bank">Bank Account</option>
                  <option value="wallet">Mobile Wallet</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  placeholder="USD"
                  maxLength="3"
                />
              </div>

              <div className="form-group">
                <label>Account Number (Optional)</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="0123456789"
                />
              </div>

              <div className="form-group">
                <label>Initial Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this account"
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel
                </button>
                <button type="submit" className="btn-primary">Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;
