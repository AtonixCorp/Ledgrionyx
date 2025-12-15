import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaPlus, FaEdit, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRobot, FaDatabase } from 'react-icons/fa';
import taxCalculatorService from '../../services/taxCalculatorService';
import './TaxAdmin.css';

const TaxAdmin = () => {
  const [countries, setCountries] = useState([]);
  const [pendingSuggestions, setPendingSuggestions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formData, setFormData] = useState({
    country: '',
    code: '',
    rate: '',
    personal: '',
    vat: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCountries(taxCalculatorService.getAllCountriesData());
    setPendingSuggestions(taxCalculatorService.getPendingAISuggestions());
    setWarnings(taxCalculatorService.getAdminWarnings());
  };

  const handleAddCountry = (e) => {
    e.preventDefault();
    const result = taxCalculatorService.addCountry(formData.country, {
      code: formData.code,
      rate: parseFloat(formData.rate) || 0,
      personal: parseFloat(formData.personal) || 0,
      vat: parseFloat(formData.vat),
      notes: formData.notes,
      aiVerified: false
    });

    if (result.success) {
      alert('Country added successfully!');
      setShowAddForm(false);
      setFormData({ country: '', code: '', rate: '', personal: '', vat: '', notes: '' });
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleUpdateCountry = (e) => {
    e.preventDefault();
    const result = taxCalculatorService.updateTaxRate(selectedCountry, {
      rate: parseFloat(formData.rate),
      personal: parseFloat(formData.personal),
      vat: parseFloat(formData.vat),
      notes: formData.notes
    }, true);

    if (result.success) {
      alert('Country updated successfully!');
      setShowEditForm(false);
      setSelectedCountry(null);
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleEditClick = (country) => {
    setSelectedCountry(country.country);
    setFormData({
      country: country.country,
      code: country.code,
      rate: country.rate,
      personal: country.personal,
      vat: country.vat,
      notes: country.notes || ''
    });
    setShowEditForm(true);
  };

  const handleApproveSuggestion = (suggestionId) => {
    const result = taxCalculatorService.approveAISuggestion(suggestionId);
    if (result.success) {
      alert('AI suggestion approved and applied!');
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleRejectSuggestion = (suggestionId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      const result = taxCalculatorService.rejectAISuggestion(suggestionId, reason);
      if (result.success) {
        alert('AI suggestion rejected');
        loadData();
      }
    }
  };

  const exportData = () => {
    const data = taxCalculatorService.exportTaxData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="tax-admin-page">
      <div className="page-header">
        <h1 className="page-title">
          <FaShieldAlt /> Tax Rate Administration
        </h1>
        <p className="page-subtitle">
          Manage global tax rates, approve AI suggestions, and monitor system warnings
        </p>
      </div>

      {/* AI Suggestions Panel */}
      {pendingSuggestions.length > 0 && (
        <div className="admin-card suggestions-panel">
          <h2><FaRobot /> Pending AI Suggestions ({pendingSuggestions.length})</h2>
          <div className="suggestions-list">
            {pendingSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item">
                <div className="suggestion-info">
                  <h4>{suggestion.country}</h4>
                  <p className="suggestion-detail">
                    <strong>{suggestion.taxType}</strong>: 
                    {suggestion.currentRate}% → {suggestion.suggestedRate}%
                  </p>
                  <p className="suggestion-reason">{suggestion.reason}</p>
                  <span className={`confidence-badge confidence-${Math.floor(suggestion.confidence / 20)}`}>
                    Confidence: {suggestion.confidence}%
                  </span>
                </div>
                <div className="suggestion-actions">
                  <button 
                    onClick={() => handleApproveSuggestion(suggestion.id)}
                    className="btn-approve"
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button 
                    onClick={() => handleRejectSuggestion(suggestion.id)}
                    className="btn-reject"
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <div className="admin-card warnings-panel">
          <h2><FaExclamationTriangle /> System Warnings ({warnings.length})</h2>
          <div className="warnings-list">
            {warnings.slice(0, 5).map(warning => (
              <div key={warning.id} className={`warning-item warning-${warning.type}`}>
                <FaExclamationTriangle className="warning-icon" />
                <div className="warning-content">
                  <h4>{warning.country} - {warning.taxType}</h4>
                  <p>{warning.message}</p>
                  <p className="warning-recommendation">{warning.recommendation}</p>
                  <small>{new Date(warning.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="actions-bar">
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <FaPlus /> Add New Country
        </button>
        <button onClick={exportData} className="btn-secondary">
          <FaDatabase /> Export Data
        </button>
      </div>

      {/* Add Country Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><FaPlus /> Add New Country</h2>
            <form onSubmit={handleAddCountry}>
              <div className="form-group">
                <label>Country Name *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="e.g., South Africa"
                  required
                />
              </div>
              <div className="form-group">
                <label>Country Code (ISO) *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., ZA"
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Corporate Tax Rate</label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    placeholder="e.g., 27"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Personal Tax Rate</label>
                  <input
                    type="number"
                    value={formData.personal}
                    onChange={(e) => setFormData({...formData, personal: e.target.value})}
                    placeholder="e.g., 45"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>VAT / Sales Tax * </label>
                  <input
                    type="number"
                    value={formData.vat}
                    onChange={(e) => setFormData({...formData, vat: e.target.value})}
                    placeholder="e.g., 15"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional information about the tax rate..."
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Add Country</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Country Form */}
      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><FaEdit /> Edit Tax Rates - {formData.country}</h2>
            <form onSubmit={handleUpdateCountry}>
              <div className="form-row">
                <div className="form-group">
                  <label>Corporate Tax Rate</label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Personal Tax Rate</label>
                  <input
                    type="number"
                    value={formData.personal}
                    onChange={(e) => setFormData({...formData, personal: e.target.value})}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>VAT / Sales Tax</label>
                  <input
                    type="number"
                    value={formData.vat}
                    onChange={(e) => setFormData({...formData, vat: e.target.value})}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Update Country</button>
                <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Countries Table */}
      <div className="admin-card countries-table">
        <h2><FaDatabase /> All Countries ({countries.length})</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Code</th>
                <th>Corporate</th>
                <th>Personal</th>
                <th>VAT</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map(country => (
                <tr key={country.country}>
                  <td className="country-name">{country.country}</td>
                  <td className="country-code">{country.code}</td>
                  <td>{country.rate}%</td>
                  <td>{country.personal}%</td>
                  <td><strong>{country.vat}%</strong></td>
                  <td>{country.lastUpdated}</td>
                  <td>
                    {country.aiVerified ? (
                      <span className="status-verified"><FaCheckCircle /> Verified</span>
                    ) : (
                      <span className="status-pending"><FaExclamationTriangle /> Pending</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(country)}
                      className="btn-edit"
                    >
                      <FaEdit /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxAdmin;
