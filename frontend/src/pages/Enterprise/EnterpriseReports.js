import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';

const EnterpriseReports = () => {
  const { currentOrganization } = useEnterprise();
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const reports = [
    {
      id: 'tax-exposure',
      name: 'Multi-Entity Tax Exposure Report',
      description: 'Consolidated tax liability and exposure across all entities and jurisdictions',
      icon: 'chart',
      sections: ['Summary', 'By Entity', 'By Country', 'Trends']
    },
    {
      id: 'pnl-summary',
      name: 'Entity P&L Summary',
      description: 'Profit and loss statement for each entity with year-over-year comparison',
      icon: 'chart',
      sections: ['Executive Summary', 'By Entity', 'Variance Analysis']
    },
    {
      id: 'compliance-status',
      name: 'Compliance Status Export',
      description: 'Filing status, deadlines, and compliance calendar for all entities',
      icon: 'checklist',
      sections: ['Filing Status', 'Upcoming Deadlines', 'Compliance Matrix']
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary PDF',
      description: 'High-level overview with key metrics, risks, and recommendations',
      icon: 'document',
      sections: ['Key Metrics', 'Risk Analysis', 'Recommendations', 'Financial Summary']
    },
    {
      id: 'cash-forecast',
      name: 'Cash Flow Forecast Report',
      description: 'Monthly and quarterly cash projections with assumptions',
      icon: 'chart',
      sections: ['Current Position', 'Monthly Forecast', 'Currency Analysis', 'Obligations']
    },
  ];

  const handleGenerateReport = () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      alert('Please select a report and date range');
      return;
    }

    setGenerating(true);
    // TODO: Call API endpoint /api/reports/{reportId}/generate/
    // with parameters: organization_id, start_date, end_date, format
    console.log(`Generating ${selectedReport} report from ${dateRange.start} to ${dateRange.end} in ${format} format`);

    // Simulate generation
    setTimeout(() => {
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${selectedReport}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      setGenerating(false);
      alert('Report generated successfully!');
    }, 1500);
  };

  const handleDownloadSample = (reportId) => {
    // TODO: Call API endpoint to download sample report
    console.log(`Downloading sample for ${reportId}`);
    alert(`Sample ${reportId} report downloaded!`);
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h1>Reports & Exports</h1>
          <p>Generate comprehensive financial and compliance reports</p>
        </div>
      </div>

      <div className="reports-layout">
        {/* Left: Report List */}
        <div className="reports-list-section">
          <h2>Available Reports</h2>
          <div className="reports-menu">
            {reports.map(report => (
              <div
                key={report.id}
                className={`report-menu-item ${selectedReport === report.id ? 'selected' : ''}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="item-title">{report.name}</div>
                <div className="item-desc">{report.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Report Configuration */}
        <div className="report-config-section">
          {selectedReport ? (
            <>
              {/* Selected Report Details */}
              <div className="selected-report-card">
                {reports.find(r => r.id === selectedReport) && (
                  <>
                    <h2>{reports.find(r => r.id === selectedReport)?.name}</h2>
                    <p>{reports.find(r => r.id === selectedReport)?.description}</p>

                    <div className="report-sections">
                      <h3>Report Sections:</h3>
                      <ul>
                        {reports.find(r => r.id === selectedReport)?.sections.map((section, idx) => (
                          <li key={idx}>{section}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Configuration Options */}
              <div className="config-card">
                <h3>Report Period</h3>
                <div className="date-inputs">
                  <div className="input-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div className="config-card">
                <h3>Export Format</h3>
                <div className="format-buttons">
                  <button
                    className={`format-btn ${format === 'pdf' ? 'selected' : ''}`}
                    onClick={() => setFormat('pdf')}
                  >PDF
                  </button>
                  <button
                    className={`format-btn ${format === 'excel' ? 'selected' : ''}`}
                    onClick={() => setFormat('excel')}
                  >Excel
                  </button>
                  <button
                    className={`format-btn ${format === 'csv' ? 'selected' : ''}`}
                    onClick={() => setFormat('csv')}
                  >CSV
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-primary"
                  onClick={handleGenerateReport}
                  disabled={generating}
                >
                   {generating ? 'Generating...' : 'Generate & Download'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleDownloadSample(selectedReport)}
                >Download Sample
                </button>
              </div>

              {/* Sample Preview */}
              <div className="preview-card">
                <h3>Preview</h3>
                <div className="preview-content">
                  <div className="preview-item">
                    <div className="preview-label">Organization</div>
                    <div className="preview-value">{currentOrganization?.name || 'Organization Name'}</div>
                  </div>
                  <div className="preview-item">
                    <div className="preview-label">Period</div>
                    <div className="preview-value">{dateRange.start} to {dateRange.end}</div>
                  </div>
                  <div className="preview-item">
                    <div className="preview-label">Format</div>
                    <div className="preview-value">{format.toUpperCase()}</div>
                  </div>
                  <div className="preview-item">
                    <div className="preview-label">Generated</div>
                    <div className="preview-value">On demand</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h2>Select a Report</h2>
              <p>Choose a report from the list on the left to configure and generate it</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="recent-reports-section">
        <h2>Recent Reports</h2>
        <div className="recent-reports-grid">
          {[
            { name: 'Tax Exposure Report Q4 2024', date: '2025-01-10', format: 'PDF' },
            { name: 'Entity P&L Summary 2024', date: '2025-01-08', format: 'PDF' },
            { name: 'Compliance Status Dec 2024', date: '2025-01-05', format: 'Excel' },
            { name: 'Executive Summary - Year End', date: '2024-12-31', format: 'PDF' },
          ].map((report, idx) => (
            <div key={idx} className="recent-report-card">
              <div className="report-name">{report.name}</div>
              <div className="report-meta">
                <span className="report-date">{report.date}</span>
                <span className="report-format">{report.format}</span>
              </div>
              <div className="report-actions">
                <button className="btn-icon" title="Download">

                </button>
                <button className="btn-icon" title="Share">
                  ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseReports;
