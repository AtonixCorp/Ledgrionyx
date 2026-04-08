import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { enterpriseReportingAPI } from '../../services/api';
import './EnterpriseActionPages.css';

const sectionDefinitions = [
  {
    id: 'consolidated_statements',
    name: 'Consolidated Statements',
    description: 'Balance sheet, P&L, and cash posture across the organization.',
  },
  {
    id: 'cashflow_automation',
    name: 'Cash Flow Automation',
    description: 'Forecast horizon, projected cash movement, and automation coverage.',
  },
  {
    id: 'budgeting_and_forecasting',
    name: 'Budgeting & Forecasting',
    description: 'Budget coverage, forecast spend, and the largest gaps to plan.',
  },
  {
    id: 'variance_analysis',
    name: 'Variance Analysis',
    description: 'Largest budget and forecasting variances requiring review.',
  },
  {
    id: 'scenario_dashboard',
    name: 'Scenario Dashboard',
    description: 'Current scenario mix and highest-signal model outcomes.',
  },
  {
    id: 'equity_waterfalls',
    name: 'Equity Waterfalls',
    description: 'Cap table posture and latest liquidation waterfall snapshots.',
  },
  {
    id: 'automated_compliance_reports',
    name: 'Compliance Automation',
    description: 'Deadline posture, tax exposure, document coverage, and audit automation.',
  },
];

const formatMoney = (value, currency = 'USD') => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const SnapshotGrid = ({ items }) => (
  <div className="recent-reports-grid">
    {items.map((item) => (
      <div key={item.key} className="recent-report-card">
        <div className="report-name">{item.title}</div>
        {item.rows.map((row) => (
          <div key={row.label} className="report-meta">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const EnterpriseReports = () => {
  const { currentOrganization } = useEnterprise();
  const [selectedSection, setSelectedSection] = useState('consolidated_statements');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  const loadReportingPack = useCallback(async () => {
    if (!currentOrganization?.id) {
      setReportData(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await enterpriseReportingAPI.dashboard({
        organization_id: currentOrganization.id,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      setReportData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Failed to load enterprise reporting data.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, dateRange.end, dateRange.start]);

  useEffect(() => {
    loadReportingPack();
  }, [loadReportingPack]);

  const handleDownloadJson = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enterprise-reporting-${currentOrganization?.id || 'organization'}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (!currentOrganization?.id) return;

    setExporting(format);
    try {
      const params = {
        organization_id: currentOrganization.id,
        start_date: dateRange.start,
        end_date: dateRange.end,
      };
      const response = format === 'pdf'
        ? await enterpriseReportingAPI.exportPdf(params)
        : await enterpriseReportingAPI.exportXlsx(params);
      const contentDisposition = response.headers?.['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const filename = filenameMatch?.[1] || `enterprise-reporting.${format}`;
      const blob = new Blob([
        response.data,
      ], {
        type: response.headers?.['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || `Failed to export ${format.toUpperCase()} board pack.`);
    } finally {
      setExporting('');
    }
  };

  const selectedDefinition = useMemo(
    () => sectionDefinitions.find((section) => section.id === selectedSection) || sectionDefinitions[0],
    [selectedSection]
  );

  const summary = reportData?.summary || {};
  const currency = reportData?.organization?.currency || 'USD';

  const renderConsolidatedStatements = () => {
    const statements = reportData?.consolidated_statements;
    if (!statements) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Consolidated Financial Statements</h2>
          <p>{statements.source === 'saved_consolidation' ? 'Using the latest completed consolidation run.' : 'Using a live aggregation of entity-level accounting data for the selected period.'}</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Revenue</div>
              <div className="preview-value">{formatMoney(summary.revenue, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Expenses</div>
              <div className="preview-value">{formatMoney(summary.expenses, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Net Income</div>
              <div className="preview-value">{formatMoney(summary.net_income, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Intercompany Eliminations</div>
              <div className="preview-value">{statements.intercompany_eliminations || 0}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Entity Rollup</h3>
          <SnapshotGrid
            items={(statements.entities || []).map((entity) => ({
              key: String(entity.entity_id),
              title: entity.entity_name,
              rows: [
                { label: 'Revenue', value: formatMoney(entity.revenue, currency) },
                { label: 'Net Income', value: formatMoney(entity.net_income, currency) },
                { label: 'Cash', value: formatMoney(entity.cash, currency) },
                { label: 'Liabilities', value: formatMoney(entity.liabilities, currency) },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderCashflowAutomation = () => {
    const cashflow = reportData?.cashflow_automation;
    if (!cashflow) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Cash Flow Automation</h2>
          <p>Treasury visibility across actual movements, forecasted net cash, and automation coverage.</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Forecast Rows</div>
              <div className="preview-value">{cashflow.automation?.cashflow_forecast_rows || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Recurring Transactions</div>
              <div className="preview-value">{cashflow.automation?.recurring_transaction_templates || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Recurring Journals</div>
              <div className="preview-value">{cashflow.automation?.recurring_journal_templates || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Automation Workflows</div>
              <div className="preview-value">{cashflow.automation?.automation_workflows || 0}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Monthly Cash Timeline</h3>
          <SnapshotGrid
            items={(cashflow.timeline || []).map((month) => ({
              key: month.month,
              title: month.month,
              rows: [
                { label: 'Actual Net', value: formatMoney(month.actual_net, currency) },
                { label: 'Forecast Net', value: formatMoney(month.forecast_net, currency) },
                { label: 'Opening Cash', value: formatMoney(month.opening_cash, currency) },
                { label: 'Projected Closing', value: formatMoney(month.projected_closing_cash, currency) },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderBudgeting = () => {
    const budgets = reportData?.budgeting_and_forecasting;
    if (!budgets) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Budgeting & Forecasting</h2>
          <p>Current plan coverage with forecast spend and the largest operating variances.</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Budget Limit</div>
              <div className="preview-value">{formatMoney(budgets.summary?.budget_limit, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Actual Spend</div>
              <div className="preview-value">{formatMoney(budgets.summary?.actual_spend, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Forecast Spend</div>
              <div className="preview-value">{formatMoney(budgets.summary?.forecast_spend, currency)}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Variance</div>
              <div className="preview-value">{formatMoney(budgets.summary?.variance, currency)}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Top Variances</h3>
          <SnapshotGrid
            items={(budgets.top_variances || []).map((item) => ({
              key: `${item.entity_id}-${item.category}`,
              title: `${item.entity_name} · ${item.category}`,
              rows: [
                { label: 'Forecast', value: formatMoney(item.forecast, currency) },
                { label: 'Variance', value: formatMoney(item.variance, currency) },
                { label: 'Remaining', value: formatMoney(item.remaining, currency) },
                { label: 'Utilization', value: formatPercent(item.utilization_percent) },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderScenarios = () => {
    const scenarios = reportData?.scenario_dashboard;
    if (!scenarios) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Scenario Dashboard</h2>
          <p>Modeled outcomes tracked across the organization’s financial models.</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Scenario Count</div>
              <div className="preview-value">{scenarios.count || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Best Cases</div>
              <div className="preview-value">{scenarios.by_type?.best || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Base Cases</div>
              <div className="preview-value">{scenarios.by_type?.base || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Worst Cases</div>
              <div className="preview-value">{scenarios.by_type?.worst || 0}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Highest-Signal Scenarios</h3>
          <SnapshotGrid
            items={(scenarios.top_scenarios || []).map((scenario) => ({
              key: String(scenario.id),
              title: scenario.name,
              rows: [
                { label: 'Model', value: scenario.financial_model_name },
                { label: 'Type', value: scenario.scenario_type },
                { label: 'Enterprise Value', value: formatMoney(scenario.enterprise_value, currency) },
                { label: 'IRR', value: formatPercent((scenario.irr || 0) * 100) },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderEquity = () => {
    const equity = reportData?.equity_waterfalls;
    if (!equity) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Equity Waterfall Reports</h2>
          <p>Latest cap table posture and liquidation waterfall availability by enabled entity.</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Enabled Entities</div>
              <div className="preview-value">{equity.enabled_entities || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Waterfalls Ready</div>
              <div className="preview-value">{(equity.entities || []).filter((item) => item.status === 'ready').length}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Waterfall Coverage</h3>
          <SnapshotGrid
            items={(equity.entities || []).map((item) => ({
              key: String(item.entity_id),
              title: item.entity_name,
              rows: [
                { label: 'Status', value: item.status },
                { label: 'FD Shares', value: String(item.cap_table?.fully_diluted_shares || 0) },
                { label: 'Latest Report', value: item.latest_report_title || 'No saved report' },
                { label: 'Fallback Scenario', value: item.fallback_generated ? 'Generated' : 'Not needed' },
                { label: 'Waterfalls', value: String((item.waterfalls || []).length) },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderCompliance = () => {
    const compliance = reportData?.automated_compliance_reports;
    if (!compliance) return null;

    return (
      <>
        <div className="selected-report-card">
          <h2>Automated Compliance Reports</h2>
          <p>Deadlines, tax exposure, document coverage, and audit activity in one operating pack.</p>
          <div className="preview-content">
            <div className="preview-item">
              <div className="preview-label">Upcoming</div>
              <div className="preview-value">{compliance.status_counts?.upcoming || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Due Soon</div>
              <div className="preview-value">{compliance.status_counts?.due_soon || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Overdue</div>
              <div className="preview-value">{compliance.status_counts?.overdue || 0}</div>
            </div>
            <div className="preview-item">
              <div className="preview-label">Completion Rate</div>
              <div className="preview-value">{formatPercent(compliance.automation?.deadline_completion_rate)}</div>
            </div>
          </div>
        </div>
        <div className="config-card">
          <h3>Upcoming Deadlines</h3>
          <SnapshotGrid
            items={(compliance.upcoming_deadlines || []).map((deadline) => ({
              key: String(deadline.id),
              title: `${deadline.entity_name} · ${deadline.title}`,
              rows: [
                { label: 'Type', value: deadline.deadline_type },
                { label: 'Status', value: deadline.status },
                { label: 'Due', value: deadline.deadline_date },
              ],
            }))}
          />
        </div>
      </>
    );
  };

  const renderSelectedSection = () => {
    switch (selectedSection) {
      case 'consolidated_statements':
        return renderConsolidatedStatements();
      case 'cashflow_automation':
        return renderCashflowAutomation();
      case 'budgeting_and_forecasting':
      case 'variance_analysis':
        return renderBudgeting();
      case 'scenario_dashboard':
        return renderScenarios();
      case 'equity_waterfalls':
        return renderEquity();
      case 'automated_compliance_reports':
        return renderCompliance();
      default:
        return null;
    }
  };

  return (
    <div className="reports-container enterprise-action-page">
      <section className="action-page-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Workspace — Advanced Reporting</span>
          <h1 className="action-page-title">Enterprise Reporting & Automation</h1>
          <p className="action-page-subtitle">Consolidated statements, treasury forecasting, budget variance, scenario reporting, waterfall visibility, and compliance automation in one operating layer.</p>
          <div className="action-page-actions">
            <button className="btn-primary" onClick={loadReportingPack} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Reporting Pack'}
            </button>
            <button className="btn-secondary" onClick={handleDownloadJson} disabled={!reportData}>
              Download JSON Snapshot
            </button>
            <button className="btn-secondary" onClick={() => handleExport('pdf')} disabled={!reportData || exporting === 'pdf'}>
              {exporting === 'pdf' ? 'Exporting PDF...' : 'Export PDF Board Pack'}
            </button>
            <button className="btn-secondary" onClick={() => handleExport('xlsx')} disabled={!reportData || exporting === 'xlsx'}>
              {exporting === 'xlsx' ? 'Exporting XLSX...' : 'Export XLSX Board Pack'}
            </button>
          </div>
        </div>
        <div className="action-page-badge">{currentOrganization?.name || 'Organization'}</div>
      </section>

      <section className="action-page-stats">
        <div className="action-page-stat">
          <span className="action-page-stat-label">Entities Covered</span>
          <span className="action-page-stat-value">{summary.entities_covered || 0}</span>
          <span className="action-page-stat-caption">Entity rollup in the current reporting pack</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Net Income</span>
          <span className="action-page-stat-value">{formatMoney(summary.net_income, currency)}</span>
          <span className="action-page-stat-caption">Consolidated performance for the selected period</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Cash On Hand</span>
          <span className="action-page-stat-value">{formatMoney(summary.cash_on_hand, currency)}</span>
          <span className="action-page-stat-caption">Current cash position across bank and wallet balances</span>
        </div>
      </section>

      <div className="reports-layout">
        <div className="reports-list-section">
          <h2>Reporting Layers</h2>
          <div className="reports-menu">
            {sectionDefinitions.map((section) => (
              <div
                key={section.id}
                className={`report-menu-item ${selectedSection === section.id ? 'selected' : ''}`}
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="item-title">{section.name}</div>
                <div className="item-desc">{section.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-config-section">
          <div className="config-card">
            <h3>Reporting Period</h3>
            <div className="date-inputs">
              <div className="input-group">
                <label>From</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(event) => setDateRange({ ...dateRange, start: event.target.value })}
                />
              </div>
              <div className="input-group">
                <label>To</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(event) => setDateRange({ ...dateRange, end: event.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="preview-card">
            <h3>{selectedDefinition.name}</h3>
            <div className="preview-content">
              <div className="preview-item">
                <div className="preview-label">Organization</div>
                <div className="preview-value">{reportData?.organization?.name || currentOrganization?.name || 'Organization'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Period</div>
                <div className="preview-value">{dateRange.start} to {dateRange.end}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Data State</div>
                <div className="preview-value">{loading ? 'Refreshing' : reportData ? 'Live' : 'Unavailable'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Coverage</div>
                <div className="preview-value">{summary.entities_covered || 0} entities</div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="selected-report-card">
              <h2>Reporting Unavailable</h2>
              <p>{error}</p>
            </div>
          ) : null}

          {!error && !loading && reportData ? renderSelectedSection() : null}

          {loading ? (
            <div className="selected-report-card">
              <h2>Refreshing Reporting Pack</h2>
              <p>Collecting consolidated statements, forecast data, scenario outputs, waterfall reports, and compliance signals.</p>
            </div>
          ) : null}

          {!loading && !error && !reportData ? (
            <div className="no-selection">
              <h2>No Reporting Pack</h2>
              <p>Select a valid organization and reporting period to load enterprise reporting.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="recent-reports-section">
        <h2>Current Operating Snapshot</h2>
        <SnapshotGrid
          items={[
            {
              key: 'revenue',
              title: 'Revenue',
              rows: [{ label: 'Consolidated', value: formatMoney(summary.revenue, currency) }],
            },
            {
              key: 'expenses',
              title: 'Expenses',
              rows: [{ label: 'Consolidated', value: formatMoney(summary.expenses, currency) }],
            },
            {
              key: 'assets',
              title: 'Total Assets',
              rows: [{ label: 'Balance Sheet', value: formatMoney(summary.total_assets, currency) }],
            },
            {
              key: 'equity',
              title: 'Equity',
              rows: [{ label: 'Shareholders', value: formatMoney(summary.equity, currency) }],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default EnterpriseReports;
