import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';
import { FaShieldAlt, FaDownload } from 'react-icons/fa';

const mockAudit = [
  { timestamp: '2025-01-31 14:23:01', user: 'sarah.johnson@atc.com', action: 'Journal Entry Created', entity: 'JE-2025-0142', changes: 'Debit: Rent Expense $5,500 / Credit: Cash $5,500', ip: '192.168.1.45' },
  { timestamp: '2025-01-31 11:05:33', user: 'michael.chen@atc.com', action: 'Invoice Approved', entity: 'INV-0001', changes: 'Status: Draft → Approved', ip: '192.168.1.62' },
  { timestamp: '2025-01-30 16:44:12', user: 'admin@atc.com', action: 'User Permission Changed', entity: 'lisa.rodriguez', changes: 'Role: Viewer → Editor', ip: '10.0.0.1' },
  { timestamp: '2025-01-30 09:12:55', user: 'sarah.johnson@atc.com', action: 'Period Closed', entity: 'Dec 2024', changes: 'Month closed, no further edits allowed', ip: '192.168.1.45' },
  { timestamp: '2025-01-28 15:30:00', user: 'michael.chen@atc.com', action: 'Account Modified', entity: 'GL-5001', changes: 'Account name updated: "Salaries" → "Salaries & Wages"', ip: '192.168.1.62' },
];

const columns = [
  { key: 'timestamp', header: 'Timestamp' },
  { key: 'user', header: 'User' },
  { key: 'action', header: 'Action' },
  { key: 'entity', header: 'Entity / Record' },
  { key: 'changes', header: 'Details' },
  { key: 'ip', header: 'IP Address' },
];

export default function AuditTrail() {
  return (
    <div className="module-page">
      <PageHeader
        title="Audit Trail"
        subtitle="Immutable log of all user actions, changes, and system events"
        icon={<FaShieldAlt />}
        actions={
          <Button variant="secondary" size="small" icon={<FaDownload />}>Export Audit Log</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Events (Last 30 Days)</div>
          <div className="stat-value">247</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">5</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Critical Events</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>2</div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <Table columns={columns} data={mockAudit} />
      </Card>
    </div>
  );
}
