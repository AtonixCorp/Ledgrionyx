import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useEnterprise } from '../../../context/EnterpriseContext';

const CategoryManager = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const {
    fetchBookkeepingCategories,
    createBookkeepingCategory,
    createDefaultCategories,
    entities
  } = useEnterprise();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    description: ''
  });

  const entity = entities.find(e => e.id === parseInt(entityId));

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const data = await fetchBookkeepingCategories(entityId);
    setCategories(data.results || data);
    setLoading(false);
  }, [entityId, fetchBookkeepingCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateDefaults = async () => {
    if (categories.length > 0) {
      if (!window.confirm('Default categories may already exist. Create them anyway?')) {
        return;
      }
    }

    try {
      await createDefaultCategories(entityId);
      alert('Default categories created successfully!');
      loadCategories();
    } catch (err) {
      alert('Failed to create default categories: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createBookkeepingCategory({
        entity: parseInt(entityId),
        ...formData
      });
      alert('Category created successfully!');
      setShowForm(false);
      setFormData({ name: '', type: 'expense', description: '' });
      loadCategories();
    } catch (err) {
      alert('Failed to create category: ' + err.message);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <div className="category-manager">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9fafb' }}>
      {/* Topbar */}
      <div style={{ height: 60, background: '#003B73', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)', margin: '0 16px' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>ATC Capital</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>/</span>
          <span style={{ color: '#fff', fontSize: 13 }}>{entity?.name || 'Categories'}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#10B981', color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Active</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{entity?.country} • {entity?.entity_type}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
    <div className="category-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Categories</h1>
          <p>{entity?.name} • {categories.length} categories</p>
        </div>
        <div className="header-right">
          {categories.length === 0 && (
            <button className="btn-secondary" onClick={handleCreateDefaults}>
              Create Defaults
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            New Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {/* Income Categories */}
        <div className="category-section">
          <div className="section-header income">

            <h3>Income Categories</h3>
            <span className="count">{incomeCategories.length}</span>
          </div>

          <div className="category-list">
            {incomeCategories.length > 0 ? (
              incomeCategories.map(category => (
                <div key={category.id} className="category-card income">
                  <div className="category-header">
                    <h4>{category.name}</h4>
                    {category.is_default && <span className="badge-default">Default</span>}
                  </div>
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                  <div className="category-stats">
                    <span>{category.transaction_count || 0} transactions</span>
                    <span className="amount">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: entity?.local_currency || 'USD'
                      }).format(category.total_amount || 0)}
                    </span>
                  </div>
                  <div className="category-actions">
                    <button className="btn-icon" title="Edit category">

                    </button>
                    {!category.is_default && (
                      <button className="btn-icon btn-delete" title="Delete category">

                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No income categories yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="category-section">
          <div className="section-header expense">

            <h3>Expense Categories</h3>
            <span className="count">{expenseCategories.length}</span>
          </div>

          <div className="category-list">
            {expenseCategories.length > 0 ? (
              expenseCategories.map(category => (
                <div key={category.id} className="category-card expense">
                  <div className="category-header">
                    <h4>{category.name}</h4>
                    {category.is_default && <span className="badge-default">Default</span>}
                  </div>
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                  <div className="category-stats">
                    <span>{category.transaction_count || 0} transactions</span>
                    <span className="amount">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: entity?.local_currency || 'USD'
                      }).format(category.total_amount || 0)}
                    </span>
                  </div>
                  <div className="category-actions">
                    <button className="btn-icon" title="Edit category">

                    </button>
                    {!category.is_default && (
                      <button className="btn-icon btn-delete" title="Delete category">

                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No expense categories yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Category Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing Expenses"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel
                </button>
                <button type="submit" className="btn-primary">Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CategoryManager;
