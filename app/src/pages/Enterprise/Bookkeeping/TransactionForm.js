import React, { useState, useEffect, useCallback } from 'react';

import { useEnterprise } from '../../../context/EnterpriseContext';
import '../../../styles/EntityPages.css';

const TransactionForm = ({ entityId, transaction, onClose, onSave }) => {
  const {
    fetchBookkeepingCategories,
    fetchBookkeepingAccounts,
    createTransaction,
    updateTransaction,
    entities
  } = useEnterprise();

  const entity = entities.find((item) => String(item.id) === String(entityId));

  const [formData, setFormData] = useState({
    entity: entityId,
    type: 'expense',
    category: '',
    account: '',
    amount: '',
    currency: 'USD',
    payment_method: 'bank',
    description: '',
    reference_number: '',
    date: new Date().toISOString().split('T')[0],
    attachment_url: ''
  });

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!entity?.id) {
      setCategories([]);
      setAccounts([]);
      return;
    }
    const [categoriesData, accountsData] = await Promise.all([
      fetchBookkeepingCategories(entity.id),
      fetchBookkeepingAccounts(entity.id)
    ]);
    setCategories(categoriesData.results || categoriesData);
    setAccounts(accountsData.results || accountsData);
  }, [entity, fetchBookkeepingAccounts, fetchBookkeepingCategories]);

  useEffect(() => {
    loadData();
    if (transaction) {
      setFormData({
        ...transaction,
        entity: entity?.id || entityId,
        category: transaction.category?.id || transaction.category,
        account: transaction.account?.id || transaction.account
      });
    }
  }, [entity, entityId, loadData, transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resolvedEntityId = entity?.id || entityId;
      const payload = { ...formData, entity: resolvedEntityId };

      if (transaction) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transaction-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="close-btn">

          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Account *</label>
              <select name="account" value={formData.account} onChange={handleChange} required>
                <option value="">Select account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange} required>
                <option value="bank">Bank Transfer</option>
                <option value="wallet">Wallet</option>
                <option value="cash">Cash</option>
                <option value="card">Card Payment</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Reference Number</label>
            <input
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
               {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;