import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { useEnterprise } from '../../context/EnterpriseContext';

const emptyDashboard = {
  summary: {
    financialHealth: 'No accounting data available yet.',
    immediateAttention: 'No open workflow items.',
    liveActivity: 'No recent accounting activity.',
    nextAction: 'Create or import accounting records.',
  },
  kpis: [],
  chartSeries: {
    weekly: { inflow: [0], outflow: [0], forecast: [0] },
    monthly: { inflow: [0], outflow: [0], forecast: [0] },
    quarterly: { inflow: [0], outflow: [0], forecast: [0] },
  },
  reconciliationItems: [],
  feedItems: [],
  taskItems: [],
  alertItems: [],
  documentItems: [],
  rightPanelContent: {
    cash: {
      title: 'Cash Context',
      stats: [],
      insight: 'No dashboard context is available yet.',
      nextStep: 'Load accounting data',
      route: '/app/subledgers/cash-bank',
    },
  },
  metadata: {
    organizationName: '',
    defaultContext: 'cash',
    lastUpdated: null,
    entityCount: 0,
  },
};

const formatPoints = (series) => {
  const safeSeries = series.length ? series : [0];
  const max = Math.max(...safeSeries, 0);
  const min = Math.min(...safeSeries, 0);
  const range = max - min || 1;

  return safeSeries
    .map((point, index) => {
      const x = (index / (safeSeries.length - 1 || 1)) * 100;
      const y = 100 - ((point - min) / range) * 78 - 10;
      return `${x},${y}`;
    })
    .join('');
};

const GridContainer = ({ className = '', children }) => <div className={className}>{children}</div>;
const GridItem = ({ className = '', children }) => <div className={className}>{children}</div>;

const SectionCard = ({ title, actions, children }) => (
  <Card className="section-card">
    <div className="section-card-header">
      <div className="section-card-title">{title}</div>
      {actions ? <div className="section-card-actions">{actions}</div> : null}
    </div>
    <div className="section-card-body">{children}</div>
  </Card>
);

const KPIWidget = ({ item, active, onSelect }) => {

  return (
    <div className={`kpi-widget ${active ? 'active' : ''}`} onClick={() => onSelect(item.id)}>
      <div className="kpi-widget-header">
        <span className="kpi-widget-label">{item.label}</span>
        <span className="kpi-widget-icon"></span>
      </div>
      <div className="kpi-widget-value">{item.value}</div>
      <div className="kpi-widget-meta">
        <span className={`kpi-trend ${item.trend?.direction || 'flat'}`}>
          {item.trend?.value || '0%'}
        </span>
        <span className="kpi-widget-sub">{item.sublabel}</span>
      </div>
      {typeof item.score === 'number' ? (
        <>
          <div className="health-score-bar">
            <div className="health-score-fill" style={{ width: `${item.score}%`, background: 'var(--color-midnight-light)' }} />
          </div>
          <div className="health-badges">
            {(item.badges || []).map((badge) => (
              <span key={badge.label} className={`health-badge ${badge.tone}`}>
                {badge.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="kpi-sub-row">
          {(item.details || []).map((detail) => (
            <div key={`${item.id}-${detail.label}`} className={`kpi-sub-item ${detail.tone || ''}`}>
              {detail.label} <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CashFlowGraph = ({ period, onChangePeriod, series }) => (
  <SectionCard
    title="Cash Flow Timeline"
    actions={
      <div className="cf-tab-row">
        {['weekly', 'monthly', 'quarterly'].map((key) => (
          <button
            key={key}
            type="button"
            className={`cf-tab ${period === key ? 'active' : ''}`}
            onClick={() => onChangePeriod(key)}
          >
            {key}
          </button>
        ))}
      </div>
    }
  >
    <div className="cf-chart-area">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cf-chart-svg">
        <polyline fill="none" stroke="var(--color-midnight-light)" strokeWidth="2.2" points={formatPoints(series.inflow || [0])} />
        <polyline fill="none" stroke="var(--color-silver-dark)" strokeWidth="2.2" points={formatPoints(series.outflow || [0])} />
        <polyline fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeDasharray="3 2" points={formatPoints(series.forecast || [0])} />
      </svg>
    </div>
    <div className="cf-legend">
      <div className="cf-legend-item"><span className="cf-legend-dot" style={{ background: 'var(--color-midnight-light)' }} />Inflows</div>
      <div className="cf-legend-item"><span className="cf-legend-dot" style={{ background: 'var(--color-silver-dark)' }} />Outflows</div>
      <div className="cf-legend-item"><span className="cf-legend-dot" style={{ background: 'var(--color-cyan)' }} />Forecast</div>
    </div>
  </SectionCard>
);

const ActivityFeed = ({ filter, onFilterChange, items, onSelectContext }) => (
  <SectionCard title="Recent Transactions Feed" actions={<Button variant="secondary" size="small">Filter</Button>}>
    <div className="feed-filters">
      {['All', 'Bank', 'Journals', 'AR', 'AP'].map((item) => (
        <button
          key={item}
          type="button"
          className={`feed-filter-btn ${filter === item ? 'active' : ''}`}
          onClick={() => onFilterChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
    <div className="feed-list">
      {items.length ? items.map((item) => (
        <div key={item.id} className="feed-item feed-item-interactive" onClick={() => onSelectContext(item.context)}>
          <div className="feed-dot">{item.type?.[0] || 'A'}</div>
          <div className="feed-content">
            <div className="feed-title">{item.title}</div>
            <div className="feed-meta">{item.meta}</div>
          </div>
          <div className={`feed-amount ${item.tone}`}>{item.amount}</div>
        </div>
      )) : <div className="empty-state">No recent accounting activity.</div>}
    </div>
  </SectionCard>
);

const ReconciliationStatus = ({ items, onSelectContext }) => (
  <SectionCard title="Reconciliation Status" actions={<Button variant="secondary" size="small">Review</Button>}>
    <div className="recon-list">
      {items.length ? items.map((item) => (
        <div key={item.name} className="recon-item" onClick={() => onSelectContext('cash')}>
          <span className={`recon-item-dot ${item.tone}`} />
          <div className="recon-item-info">
            <div className="recon-item-name">{item.name}</div>
            <div className="recon-item-status">{item.status}</div>
          </div>
          <span className={`recon-item-badge ${item.tone}`}>{item.badge}</span>
        </div>
      )) : <div className="empty-state">No reconciliation records available.</div>}
    </div>
  </SectionCard>
);

const TaskList = ({ items, onSelectContext }) => (
  <SectionCard title="Tasks & Approvals" actions={<Button variant="primary" size="small">Open Queue</Button>}>
    <div className="task-list">
      {items.length ? items.map((item) => (
        <div key={item.id} className="task-item" onClick={() => onSelectContext(item.context)}>
          <div className={`task-checkbox ${item.done ? 'done' : ''}`}>
            
          </div>
          <div className="task-body">
            <div className={`task-title ${item.done ? 'done' : ''}`}>{item.title}</div>
            <div className="task-sub">{item.sub}</div>
          </div>
          <span className={`task-badge ${item.priority}`}>{item.badgeLabel}</span>
        </div>
      )) : <div className="empty-state">No open workflow tasks.</div>}
    </div>
  </SectionCard>
);

const AlertList = ({ items, onSelectContext }) => (
  <SectionCard title="Compliance & Audit Alerts" actions={<Button variant="secondary" size="small">View All</Button>}>
    <div className="alert-list">
      {items.length ? items.map((item) => (
        <div key={item.id} className={`alert-item ${item.level}`} onClick={() => onSelectContext(item.context)}>

          <div className="alert-content">
            <div className="alert-title">{item.title}</div>
            <div className="alert-desc">{item.desc}</div>
          </div>
          <div className="alert-action">{item.action}</div>
        </div>
      )) : <div className="empty-state">No active compliance or audit alerts.</div>}
    </div>
  </SectionCard>
);

const DocumentRequests = ({ items, onSelectContext }) => (
  <SectionCard title="Document Requests" actions={<Button variant="secondary" size="small">Workspace</Button>}>
    <div className="doc-list">
      {items.length ? items.map((item) => (
        <div key={item.id} className="doc-item" onClick={() => onSelectContext(item.context)}>

          <div className="doc-item-info">
            <div className="doc-item-name">{item.name}</div>
            <div className="doc-item-sub">{item.sub}</div>
          </div>
          <span className={`doc-status ${item.status}`}>{item.status}</span>
        </div>
      )) : <div className="empty-state">No outstanding document requests.</div>}
    </div>
  </SectionCard>
);

const RightPanel = ({ content, onReset, onOpenDetails }) => (
  <aside className="right-panel">
    <div className="right-panel-card">
      <div className="right-panel-title">Contextual Insights</div>
      <div className="rp-stat-list">
        {(content.stats || []).map((item) => (
          <div key={item.label} className="rp-stat-item">
            <span className="rp-stat-label">{item.label}</span>
            <span className="rp-stat-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="rp-insight">{content.insight}</div>
    </div>
    <div className="right-panel-card">
      <div className="right-panel-title">Next Action</div>
      <div className="rp-stat-list">
        <div className="rp-stat-item">
          <span className="rp-stat-label">Current focus</span>
          <span className="rp-stat-value">{content.title}</span>
        </div>
        <div className="rp-stat-item">
          <span className="rp-stat-label">Recommended step</span>
          <span className="rp-stat-value">{content.nextStep}</span>
        </div>
      </div>
      <div className="dashboard-header-actions">
        <button type="button" className="pill-btn" onClick={onReset}>Reset panel</button>
        <button type="button" className="pill-btn primary" onClick={onOpenDetails}>Open details</button>
      </div>
    </div>
  </aside>
);

const OverviewDashboard = () => {
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganizationAccountingDashboard } = useEnterprise();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContext, setSelectedContext] = useState('cash');
  const [activityFilter, setActivityFilter] = useState('All');
  const [cashFlowPeriod, setCashFlowPeriod] = useState('weekly');

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!currentOrganization?.id) {
        setDashboard(emptyDashboard);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchOrganizationAccountingDashboard(currentOrganization.id);
        if (cancelled) return;

        const nextDashboard = data || emptyDashboard;
        setDashboard(nextDashboard);
        setSelectedContext(nextDashboard.metadata?.defaultContext || 'cash');
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError.message || 'Failed to load accounting dashboard.');
        setDashboard(emptyDashboard);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [currentOrganization?.id, fetchOrganizationAccountingDashboard]);

  const filteredFeedItems = useMemo(() => {
    if (activityFilter === 'All') {
      return dashboard.feedItems || [];
    }
    return (dashboard.feedItems || []).filter((item) => item.type === activityFilter);
  }, [activityFilter, dashboard.feedItems]);

  const rightPanel = dashboard.rightPanelContent?.[selectedContext] || dashboard.rightPanelContent?.cash || emptyDashboard.rightPanelContent.cash;
  const chartSeries = dashboard.chartSeries?.[cashFlowPeriod] || emptyDashboard.chartSeries.weekly;

  if (!currentOrganization) {
    return (
      <div className="dashboard">
        <Card className="dashboard-state-card">
          <div className="empty-state">No organization is currently selected.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <PageHeader
        title={dashboard.metadata?.organizationName || currentOrganization.name}
        subtitle={`Financial health, activity and workflows`}
        actions={
          <div className="dashboard-header-actions">
            <Button variant="primary" size="small">Open Close Workspace</Button>
          </div>
        }
      />

      {error ? <div className="dashboard-banner error">{error}</div> : null}
      {loading ? <div className="dashboard-banner">Refreshing accounting data from the backend...</div> : null}

      <div className="dashboard-summary-strip">
        <div className="summary-stat">
          <div className="summary-stat-label">Financial health</div>
          <div className="summary-stat-value">{dashboard.summary?.financialHealth}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Immediate attention</div>
          <div className="summary-stat-value">{dashboard.summary?.immediateAttention}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Live activity</div>
          <div className="summary-stat-value">{dashboard.summary?.liveActivity}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Recommended next step</div>
          <div className="summary-stat-value">{dashboard.summary?.nextAction}</div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-main">
          <section>
            <div className="band-label">Top Band · Financial Health Snapshot</div>
            <GridContainer className="kpi-grid">
              {(dashboard.kpis || []).map((item) => (
                <KPIWidget key={item.id} item={item} active={selectedContext === item.id} onSelect={setSelectedContext} />
              ))}
            </GridContainer>
          </section>

          <section>
            <div className="band-label">Middle Band · Money Movement & Activity</div>
            <GridContainer className="middle-grid">
              <GridItem className="section-span-2">
                <CashFlowGraph period={cashFlowPeriod} onChangePeriod={setCashFlowPeriod} series={chartSeries} />
              </GridItem>
              <GridItem>
                <ReconciliationStatus items={dashboard.reconciliationItems || []} onSelectContext={setSelectedContext} />
              </GridItem>
              <GridItem className="section-span-3">
                <ActivityFeed
                  filter={activityFilter}
                  onFilterChange={(nextFilter) => {
                    setActivityFilter(nextFilter);
                    const nextContext = nextFilter === 'Bank' ? 'cash' : nextFilter === 'Journals' ? 'income' : nextFilter === 'AR' ? 'ar' : nextFilter === 'AP' ? 'ap' : null;
                    if (nextContext) {
                      setSelectedContext(nextContext);
                    }
                  }}
                  items={filteredFeedItems}
                  onSelectContext={setSelectedContext}
                />
              </GridItem>
            </GridContainer>
          </section>

          <section>
            <div className="band-label">Bottom Band · Tasks, Alerts & Workflows</div>
            <GridContainer className="bottom-grid">
              <GridItem>
                <TaskList items={dashboard.taskItems || []} onSelectContext={setSelectedContext} />
              </GridItem>
              <GridItem>
                <AlertList items={dashboard.alertItems || []} onSelectContext={setSelectedContext} />
              </GridItem>
              <GridItem>
                <DocumentRequests items={dashboard.documentItems || []} onSelectContext={setSelectedContext} />
              </GridItem>
            </GridContainer>
          </section>
        </div>

        <RightPanel
          content={rightPanel}
          onReset={() => setSelectedContext(dashboard.metadata?.defaultContext || 'cash')}
          onOpenDetails={() => navigate(rightPanel.route || '/app/overview/dashboard')}
        />
      </div>
    </div>
  );
};

export default OverviewDashboard;