import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

const Income = () => {
  const { 
    income, 
    addIncome, 
    deleteIncome, 
    financialSummary,
    validationResults,
    userCountry,
    userTaxRate
  } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.source && formData.amount) {
      // Validation happens automatically in context
      await addIncome({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Use calculation engine values from context
  const totalIncome = financialSummary?.income.gross || income.reduce((sum, inc) => sum + inc.amount, 0);
  const netIncome = financialSummary?.income.net || 0;
  const taxAmount = financialSummary?.tax.amount || 0;
  const monthlyIncome = financialSummary?.income.monthly || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Income'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>Add New Income</h2>
          <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
              <label htmlFor="source">Source</label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              >
                <option value="">Select income source...</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Consulting">Consulting</option>
                <option value="Contract Work">Contract Work</option>
                <option value="Part-time Job">Part-time Job</option>
                <option value="Side Hustle">Side Hustle</option>
                <option value="Business">Business Revenue</option>
                <option value="Investment">Investment Returns</option>
                <option value="Stock Sale">Stock Sale</option>
                <option value="Crypto Gains">Crypto Gains</option>
                <option value="Rental Income">Rental Income</option>
                <option value="Dividends">Dividends</option>
                <option value="Interest">Interest</option>
                <option value="Capital Gains">Capital Gains</option>
                <option value="Royalties">Royalties</option>
                <option value="Bonus">Bonus</option>
                <option value="Commission">Commission</option>
                <option value="Tips">Tips</option>
                <option value="Overtime">Overtime</option>
                <option value="Performance Bonus">Performance Bonus</option>
                <option value="Pension">Pension</option>
                <option value="Social Security">Social Security</option>
                <option value="Retirement Fund">Retirement Fund</option>
                <option value="Annuity">Annuity</option>
                <option value="Trust Fund">Trust Fund</option>
                <option value="Inheritance">Inheritance</option>
                <option value="Gift">Gift</option>
                <option value="Grant">Grant</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Award">Award</option>
                <option value="Prize">Prize</option>
                <option value="Settlement">Settlement</option>
                <option value="Tax Refund">Tax Refund</option>
                <option value="Insurance Claim">Insurance Claim</option>
                <option value="Refund">Refund</option>
                <option value="Reimbursement">Reimbursement</option>
                <option value="Cashback">Cashback</option>
                <option value="Rebate">Rebate</option>
                <option value="Alimony">Alimony</option>
                <option value="Child Support">Child Support</option>
                <option value="Loan">Loan</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Add Income</button>
          </form>
        </div>
      )}

      {/* Financial Summary Card */}
      <div className="card">
        <div className="income-summary">
          <h2>Income Overview</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Gross Income:</label>
              <span className="total-amount-income">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Tax ({userCountry} - {userTaxRate}%):</label>
              <span className="tax-amount">-${taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-item highlight">
              <label>Net Income (After Tax):</label>
              <span className="net-amount">${netIncome.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <label>Monthly Average:</label>
              <span>${monthlyIncome.toFixed(2)}</span>
            </div>
          </div>
          
          {validationResults?.warnings && validationResults.warnings.length > 0 && (
            <div className="validation-warnings">
              <h4>⚠️ Warnings:</h4>
              {validationResults.warnings.map((warning, index) => (
                <p key={index} className="warning-text">{warning}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Income List */}
      <div className="card">
        <h2>Income Transactions</h2>
        <div className="income-list">
          {income.length > 0 ? (
            <table className="income-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {income
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((incomeItem) => (
                  <tr key={incomeItem.id}>
                    <td>{new Date(incomeItem.date).toLocaleDateString()}</td>
                    <td>{incomeItem.source}</td>
                    <td className="amount-income">${incomeItem.amount.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn-danger"
                        onClick={() => deleteIncome(incomeItem.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No income records yet. Add your first income!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Income;
