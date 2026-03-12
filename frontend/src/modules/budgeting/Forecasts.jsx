import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';

const mockForecast = [
  { month: 'Feb 2025', revenue: '$292,000', expenses: '$162,000', netIncome: '$130,000', cashFlow: '$118,000', confidence: 'High' },
  { month: 'Mar 2025', revenue: '$305,000', expenses: '$168,000', netIncome: '$137,000', cashFlow: '$124,000', confidence: 'High' },
  { month: 'Apr 2025', revenue: '$318,000', expenses: '$175,000', netIncome: '$143,000', cashFlow: '$129,000', confidence: 'Medium' },
  { month: 'May 2025', revenue: '$330,000', expenses: '$182,000', netIncome: '$148,000', cashFlow: '$133,000', confidence: 'Medium' },
  { month: 'Jun 2025', revenue: '$345,000', expenses: '$190,000', netIncome: '$155,000', cashFlow: '$140,000', confidence: 'Low' },
];

const CONFIDENCE_COLORS = { High: 'var(--color-success)', Medium: 'var(--color-warning)', Low: 'var(--color-error)' };

const columns = [
  { key: 'month', header: 'Month' },
  { key: 'revenue', header: 'Projected Revenue' },
  { key: 'expenses', header: 'Projected Expenses' },
  { key: 'netIncome', header: 'Net Income' },
  { key: 'cashFlow', header: 'Cash Flow' },
  { key: 'confidence', header: 'Confidence', render: (row) => (
    <span className="status-badge" style={{ background: CONFIDENCE_COLORS[row.confidence] }}>{row.confidence}</span>
  )},
];

export default function Forecasts() {
  return (
    <div className="module-page">
      <PageHeader
        title="Forecasts"
        subtitle="AI-assisted financial projections and scenario modeling"
        actions={
          <Button variant="secondary" size="small">Export Forecast</Button>
        }
      />

      <div className="forecast-chart">Revenue & Net Income Forecast Chart (Chart.js integration point)
      </div>

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">6-Month Revenue Forecast</div>
          <div className="stat-value">$1,590,000</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Avg Monthly Net Income</div>
          <div className="stat-value">$142,833</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Forecast Accuracy (TTM)</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>94.2%</div>
        </Card>
      </div>

      <Card title="Monthly Projections">
        <Table columns={columns} data={mockForecast} />
      </Card>
    </div>
  );
}
