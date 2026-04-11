import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';

const assetRows = [];

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

const BLANK_ASSET = { name: '', category: '', acquisitionDate: '', cost: '', method: '', usefulLife: '', salvageValue: '', glAccount: '' };

export default function FixedAssets() {
  const [showModal, setShowModal] = useState(false);
  const [assetList, setAssetList] = useState(assetRows);
  const [form, setForm] = useState(BLANK_ASSET);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const totalCost = assetList.reduce((sum, asset) => sum + (parseFloat(String(asset.cost).replace(/[^0-9.-]/g, '')) || 0), 0);
  const netBookValue = assetList.reduce((sum, asset) => sum + (parseFloat(String(asset.netBook).replace(/[^0-9.-]/g, '')) || 0), 0);
  const ytdDepreciation = assetList.reduce((sum, asset) => sum + Math.max((parseFloat(String(asset.cost).replace(/[^0-9.-]/g, '')) || 0) - (parseFloat(String(asset.netBook).replace(/[^0-9.-]/g, '')) || 0), 0), 0);
  const activeAssets = assetList.filter((asset) => asset.status === 'Active').length;

  const handleCreate = () => {
    if (!form.name.trim() || !form.cost.trim()) return;
    const costFmt = `$${parseFloat(form.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const nextId = `FA-${String(assetList.length + 1).padStart(3, '0')}`;
    setAssetList(prev => [...prev, {
      id: nextId, name: form.name, category: form.category || '—',
      cost: costFmt, accumulated: '$0.00', netBook: costFmt,
      method: form.method || 'Straight-line', life: form.usefulLife ? `${form.usefulLife} yrs` : '—',
      status: 'Active',
    }]);
    setForm(BLANK_ASSET);
    setShowModal(false);
  };

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
          <div className="stat-value">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Net Book Value</div>
          <div className="stat-value">{netBookValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">YTD Depreciation</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>{ytdDepreciation.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active Assets</div>
          <div className="stat-value">{activeAssets}</div>
        </Card>
      </div>

      <Card title="Asset Register">
        {assetList.length > 0 ? <Table columns={columns} data={assetList} /> : <p className="empty-state">No fixed assets yet. Add one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_ASSET); }} title="Add Fixed Asset" size="medium">
        <div className="form-grid">
          <Input label="Asset Name" required value={form.name} onChange={set('name')} />
          <Input label="Category" required value={form.category} onChange={set('category')} />
          <Input label="Acquisition Date" type="date" required value={form.acquisitionDate} onChange={set('acquisitionDate')} />
          <Input label="Cost" type="number" required value={form.cost} onChange={set('cost')} />
          <Input label="Depreciation Method" placeholder="Straight-line / Declining Balance" value={form.method} onChange={set('method')} />
          <Input label="Useful Life (years)" type="number" value={form.usefulLife} onChange={set('usefulLife')} />
          <Input label="Salvage Value" type="number" value={form.salvageValue} onChange={set('salvageValue')} />
          <Input label="GL Account" value={form.glAccount} onChange={set('glAccount')} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_ASSET); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim() || !form.cost.trim()}>Add Asset</Button>
        </div>
      </Modal>
    </div>
  );
}
