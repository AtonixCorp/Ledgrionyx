import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';

const mockAssets = [
  { id: 'FA-001', name: 'Office Building', category: 'Real Estate', cost: '$2,500,000.00', accumulated: '$125,000.00', netBook: '$2,375,000.00', method: 'Straight-line', life: '40 yrs', status: 'Active' },
  { id: 'FA-002', name: 'Server Infrastructure', category: 'Technology', cost: '$180,000.00', accumulated: '$72,000.00', netBook: '$108,000.00', method: 'Straight-line', life: '5 yrs', status: 'Active' },
  { id: 'FA-003', name: 'Company Vehicles (x3)', category: 'Vehicles', cost: '$120,000.00', accumulated: '$48,000.00', netBook: '$72,000.00', method: 'Declining Balance', life: '5 yrs', status: 'Active' },
  { id: 'FA-004', name: 'Leasehold Improvements', category: 'Improvements', cost: '$85,000.00', accumulated: '$85,000.00', netBook: '$0.00', method: 'Straight-line', life: '10 yrs', status: 'Fully Depreciated' },
];

const STATUS_COLORS = { Active: 'var(--color-success)', 'Fully Depreciated': 'var(--color-silver-dark)', Disposed: 'var(--color-error)' };

const columns = [
  { key: 'id', header: 'Asset ID' },
  { key: 'name', header: 'Asset Name' },
  { key: 'category', header: 'Category' },
  { key: 'cost', header: 'Cost' },
  { key: 'accumulated', header: 'Accum. Depreciation' },
  { key: 'netBook', header: 'Net Book Value' },
  { key: 'method', header: 'Method' },
  { key: 'life', header: 'Useful Life' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function FixedAssets() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Fixed Assets"
        subtitle="Manage fixed assets, depreciation schedules, and disposal tracking"
        actions={
          <>
            <Button variant="secondary" size="small">Depreciation Schedule</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Add Asset
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Assets (Cost)</div>
          <div className="stat-value">$2,885,000.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Net Book Value</div>
          <div className="stat-value">$2,555,000.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">YTD Depreciation</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>$85,400.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active Assets</div>
          <div className="stat-value">3</div>
        </Card>
      </div>

      <Card title="Asset Register">
        <Table columns={columns} data={mockAssets} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Fixed Asset" size="medium">
        <div className="form-grid">
          <Input label="Asset Name" required />
          <Input label="Category" required />
          <Input label="Acquisition Date" type="date" required />
          <Input label="Cost" type="number" required />
          <Input label="Depreciation Method" placeholder="Straight-line / Declining Balance" />
          <Input label="Useful Life (years)" type="number" />
          <Input label="Salvage Value" type="number" />
          <Input label="GL Account" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Add Asset</Button>
        </div>
      </Modal>
    </div>
  );
}
