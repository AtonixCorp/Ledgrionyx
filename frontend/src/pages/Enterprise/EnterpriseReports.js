import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { reportsAPI } from '../../services/api';
import './EnterpriseActionPages.css';

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

  const handleGenerateReport = async () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      alert('Please select a report and date range');
      return;
    }

    setGenerating(true);
    try {
      const res = await reportsAPI.create({
        report_type: selectedReport,
        organization: currentOrganization?.id,
        start_date: dateRange.start,
        end_date: dateRange.end,
        format,
      });
      const reportId = res.data.id;
      // Trigger async generation then download
      await reportsAPI.generate(reportId);
      const dlRes = await reportsAPI.download(reportId);
      const url = window.URL.createObjectURL(new Blob([dlRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.response?.data?.detail || 'Report generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadSample = async (reportId) => {
    try {
      const res = await reportsAPI.getAll({ report_type: reportId });
      const reports = res.data.results || res.data;
      if (reports.length > 0) {
        const dlRes = await reportsAPI.download(reports[0].id);
        const url = window.URL.createObjectURL(new Blob([dlRes.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportId}-sample.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('No existing report found for this type. Generate one first.');
      }
    } catch (e) {
      alert('Download failed. Please try again.');
    }
  };

  const selectedReportDefinition = reports.find((report) => report.id === selectedReport) || null;

  return (
    <div className="reports-container enterprise-action-page">
      <section className="action-page-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Workspace — Report Generation</span>
          <h1 className="action-page-title">Reports & Exports</h1>
          <p className="action-page-subtitle">Generate leadership-ready outputs from the same consolidated data surfaced in the overview.</p>
          <div className="action-page-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
        <div className="action-page-badge">{currentOrganization?.name || 'Organization'}</div>
      </section>

      <section className="action-page-stats">
        <div className="action-page-stat">
          <span className="action-page-stat-label">Available Reports</span>
          <span className="action-page-stat-value">{reports.length}</span>
          <span className="action-page-stat-caption">Templates ready for export</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Formats</span>
          <span className="action-page-stat-value">3</span>
          <span className="action-page-stat-caption">PDF, Excel, and CSV output options</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Current Focus</span>
          <span className="action-page-stat-value">{selectedReportDefinition ? selectedReportDefinition.sections.length : 0}</span>
          <span className="action-page-stat-caption">Sections in the selected report</span>
        </div>
      </section>

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
                {selectedReportDefinition && (
                  <>
                    <h2>{selectedReportDefinition.name}</h2>
                    <p>{selectedReportDefinition.description}</p>

                    <div className="report-sections">
                      <h3>Report Sections:</h3>
                      <ul>
                        {selectedReportDefinition.sections.map((section, idx) => (
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
                ↓
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
