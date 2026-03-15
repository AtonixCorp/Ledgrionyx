import React from 'react';
import '../../pages/Enterprise/EnterpriseTaxCompliance.css';
import '../../pages/Enterprise/EnterpriseActionPages.css';

const FilingAssistant = () => (
  <div className="enterprise-action-page">
    <section className="action-page-hero">
      <div className="action-page-copy">
        <span className="action-page-kicker">Compliance — Filing</span>
        <h1 className="action-page-title">Filing &amp; Submission Assistance</h1>
        <p className="action-page-subtitle">Guided tax filing and form preparation across all jurisdictions.</p>
      </div>
      <div className="action-page-badge">Filing</div>
    </section>

    <div className="filing-section">
      <div className="filing-dashboard">
        <div className="upcoming-filings">
          <h3>Upcoming Filings</h3>
          <div className="filings-list">
            <div className="filing-item">
              <div className="filing-info">
                <h4>US Form 1120</h4>
                <p>Corporate Income Tax Return</p>
                <span className="filing-due">Due: April 15, 2025</span>
              </div>
              <div className="filing-status">
                <span className="status-badge ready">Ready to File</span>
              </div>
              <div className="filing-actions">
                <button className="btn-secondary">Prepare</button>
                <button className="btn-primary">File Now</button>
              </div>
            </div>

            <div className="filing-item">
              <div className="filing-info">
                <h4>UK CT600</h4>
                <p>Corporation Tax Return</p>
                <span className="filing-due">Due: December 31, 2025</span>
              </div>
              <div className="filing-status">
                <span className="status-badge in-progress">In Progress</span>
              </div>
              <div className="filing-actions">
                <button className="btn-secondary">Continue</button>
              </div>
            </div>
          </div>
        </div>

        <div className="filing-assistance">
          <h3>Filing Assistance</h3>
          <div className="assistance-grid">
            <div className="assistance-card">
              <h4>Form Pre-filling</h4>
              <p>Auto-populate forms with your data</p>
              <button className="btn-link">Learn More</button>
            </div>
            <div className="assistance-card">
              <h4>Step-by-Step Guidance</h4>
              <p>Guided filing process with explanations</p>
              <button className="btn-link">Start Guide</button>
            </div>
            <div className="assistance-card">
              <h4>Export for Accountant</h4>
              <p>Prepare data packages for your tax professional</p>
              <button className="btn-link">Export</button>
            </div>
          </div>
        </div>

        <div className="filing-history">
          <h3>Recent Filings</h3>
          <div className="history-list">
            <div className="history-item">
              <div className="history-info">
                <h4>Q3 2024 Tax Return</h4>
                <p>Filed successfully on October 15, 2024</p>
              </div>
              <div className="history-status">
                <span className="status-badge accepted">Accepted</span>
              </div>
              <button className="btn-link">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FilingAssistant;
