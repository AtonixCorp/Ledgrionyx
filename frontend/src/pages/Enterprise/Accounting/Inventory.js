import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { inventoryItemsAPI, inventoryTransactionsAPI, inventoryCOGSAPI } from '../../../services/api';

const fmt = (v, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));

const TABS = [
  { id: 'items', label: 'Inventory Items', },
  { id: 'transactions', label: 'Transactions', },
  { id: 'cogs', label: 'COGS Report', },
];

//  Items Tab
const ItemsTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ sku: '', item_name: '', description: '', unit_of_measure: 'unit', cost_method: 'fifo', reorder_level: '0', quantity_on_hand: '0', unit_cost: '0', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await inventoryItemsAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => !search || i.item_name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  const totalValue = items.reduce((s, i) => s + parseFloat(i.total_value || 0), 0);

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ sku: item.sku, item_name: item.item_name, description: item.description || '', unit_of_measure: item.unit_of_measure || 'unit', cost_method: item.cost_method || 'fifo', reorder_level: item.reorder_level || '0', quantity_on_hand: item.quantity_on_hand || '0', unit_cost: item.unit_cost || '0', status: item.status || 'active' });
    setShowForm(true);
  };

  const handleNew = () => { setEditing(null); setForm({ sku: '', item_name: '', description: '', unit_of_measure: 'unit', cost_method: 'fifo', reorder_level: '0', quantity_on_hand: '0', unit_cost: '0', status: 'active' }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, entity: parseInt(entityId) };
      if (editing) { await inventoryItemsAPI.update(editing.id, payload); } else { await inventoryItemsAPI.create(payload); }
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Items</div><div className="acct-stat-count">{items.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Total Value</div><div className="acct-stat-count" style={{ fontSize: '1.3rem', color: '#667eea' }}>{fmt(totalValue)}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Low Stock</div><div className="acct-stat-count" style={{ color: '#e53e3e' }}>{items.filter(i => parseFloat(i.quantity_on_hand || 0) <= parseFloat(i.reorder_level || 0)).length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Active Items</div><div className="acct-stat-count" style={{ color: '#38a169' }}>{items.filter(i => i.status === 'active').length}</div></div>
      </div>
      <div className="tab-toolbar">
        <div className="acct-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by SKU or name..." /></div>
        <button className="btn-primary" onClick={handleNew}>Add Item</button>
      </div>
      {loading ? <div className="acct-loading">Loading inventory items...</div> : (
        <table className="acct-table">
          <thead><tr><th>SKU</th><th>Name</th><th>Unit</th><th>Cost Method</th><th>Qty on Hand</th><th>Unit Cost</th><th>Total Value</th><th>Reorder Level</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={9} className="empty-row">No inventory items found</td></tr> : filtered.map(item => (
              <tr key={item.id} onClick={() => handleEdit(item)} style={{ cursor: 'pointer' }}>
                <td><code className="acct-code">{item.sku}</code></td>
                <td><strong>{item.item_name}</strong>{item.description && <div className="acct-desc">{item.description}</div>}</td>
                <td>{item.unit_of_measure}</td>
                <td><span className="tag tag-type">{item.cost_method?.toUpperCase()}</span></td>
                <td style={{ color: parseFloat(item.quantity_on_hand || 0) <= parseFloat(item.reorder_level || 0) ? '#e53e3e' : '#2d3748', fontWeight: 600 }}>{item.quantity_on_hand}</td>
                <td>{fmt(item.unit_cost)}</td>
                <td style={{ fontWeight: 600, color: '#667eea' }}>{fmt(item.total_value)}</td>
                <td style={{ color: '#a0aec0' }}>{item.reorder_level}</td>
                <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Item' : 'New Inventory Item'}</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>SKU *</label><input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="PROD-001" /></div>
                <div className="form-row"><label>Item Name *</label><input value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-row-2">
                <div className="form-row"><label>Unit of Measure</label><select value={form.unit_of_measure} onChange={e => setForm(p => ({ ...p, unit_of_measure: e.target.value }))}><option value="unit">Unit</option><option value="kg">Kg</option><option value="litre">Litre</option><option value="box">Box</option><option value="meter">Meter</option></select></div>
                <div className="form-row"><label>Cost Method</label><select value={form.cost_method} onChange={e => setForm(p => ({ ...p, cost_method: e.target.value }))}><option value="fifo">FIFO</option><option value="lifo">LIFO</option><option value="weighted_avg">Weighted Average</option><option value="specific">Specific Identification</option></select></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Unit Cost</label><input type="number" step="0.0001" value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value }))} /></div>
                <div className="form-row"><label>Quantity on Hand</label><input type="number" step="0.001" value={form.quantity_on_hand} onChange={e => setForm(p => ({ ...p, quantity_on_hand: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Reorder Level</label><input type="number" step="0.001" value={form.reorder_level} onChange={e => setForm(p => ({ ...p, reorder_level: e.target.value }))} /></div>
                <div className="form-row"><label>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option><option value="discontinued">Discontinued</option></select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Save</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Transactions Tab
const TransactionsTab = ({ entityId }) => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ inventory_item: '', transaction_type: 'purchase', transaction_date: new Date().toISOString().split('T')[0], quantity: '0', unit_cost: '0', reference: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, ir] = await Promise.all([inventoryTransactionsAPI.getAll({ entity: entityId }), inventoryItemsAPI.getAll({ entity: entityId })]);
      setTransactions(r.data.results || r.data); setItems(ir.data.results || ir.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const TX_COLORS = { purchase: '#48bb78', sale: '#e53e3e', adjustment: '#ed8936', transfer: '#4299e1', return: '#805ad5' };
  const filtered = transactions.filter(t => !typeFilter || t.transaction_type === typeFilter);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await inventoryTransactionsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="tab-toolbar">
        <select className="acct-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer">Transfer</option>
          <option value="return">Return</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>New Transaction</button>
      </div>
      {loading ? <div className="acct-loading">Loading transactions...</div> : (
        <table className="acct-table">
          <thead><tr><th>Date</th><th>Item</th><th>Type</th><th>Quantity</th><th>Unit Cost</th><th>Total Cost</th><th>Reference</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="empty-row">No transactions found</td></tr> : filtered.map(t => (
              <tr key={t.id}>
                <td>{t.transaction_date}</td>
                <td><strong>{t.item_name || `Item ${t.inventory_item}`}</strong></td>
                <td><span className="tag" style={{ background: TX_COLORS[t.transaction_type] + '22', color: TX_COLORS[t.transaction_type] }}>{t.transaction_type}</span></td>
                <td style={{ color: ['sale', 'adjustment'].includes(t.transaction_type) && parseFloat(t.quantity) < 0 ? '#e53e3e' : '#38a169', fontWeight: 600 }}>{t.quantity}</td>
                <td>{fmt(t.unit_cost)}</td>
                <td style={{ fontWeight: 600 }}>{fmt(t.total_cost)}</td>
                <td>{t.reference || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Inventory Transaction</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row"><label>Item *</label><select value={form.inventory_item} onChange={e => setForm(p => ({ ...p, inventory_item: e.target.value }))}><option value="">Select item</option>{items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.item_name}</option>)}</select></div>
              <div className="form-row-2">
                <div className="form-row"><label>Transaction Type *</label><select value={form.transaction_type} onChange={e => setForm(p => ({ ...p, transaction_type: e.target.value }))}><option value="purchase">Purchase</option><option value="sale">Sale</option><option value="adjustment">Adjustment</option><option value="transfer">Transfer</option><option value="return">Return</option></select></div>
                <div className="form-row"><label>Date *</label><input type="date" value={form.transaction_date} onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Quantity *</label><input type="number" step="0.001" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
                <div className="form-row"><label>Unit Cost</label><input type="number" step="0.0001" value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Reference</label><input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="PO-123, INV-456, etc." /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Record</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  COGS Tab
const COGSTab = ({ entityId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await inventoryCOGSAPI.getAll({ entity: entityId }); setRecords(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const totalCOGS = records.reduce((s, r) => s + parseFloat(r.cogs_amount || 0), 0);

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total COGS Records</div><div className="acct-stat-count">{records.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Total COGS</div><div className="acct-stat-count" style={{ fontSize: '1.3rem', color: '#e53e3e' }}>{fmt(totalCOGS)}</div></div>
      </div>
      {loading ? <div className="acct-loading">Loading COGS data...</div> : (
        <table className="acct-table">
          <thead><tr><th>Period</th><th>Item</th><th>Cost Method</th><th>Units Sold</th><th>Avg Unit Cost</th><th>COGS Amount</th></tr></thead>
          <tbody>
            {records.length === 0 ? <tr><td colSpan={6} className="empty-row">No COGS records found</td></tr> : records.map(r => (
              <tr key={r.id}>
                <td>{r.period_start} — {r.period_end}</td>
                <td>{r.item_name || `Item ${r.inventory_item}`}</td>
                <td><span className="tag tag-type">{r.cost_method?.toUpperCase()}</span></td>
                <td>{r.units_sold}</td>
                <td>{fmt(r.average_unit_cost)}</td>
                <td style={{ fontWeight: 700, color: '#e53e3e' }}>{fmt(r.cogs_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//  Main Inventory Module
const Inventory = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track inventory items, movements, and cost of goods sold</p>
        </div>
        <button className="btn-secondary">Export</button>
      </div>

      <div className="module-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="module-tab-content">
        {activeTab === 'items' && <ItemsTab entityId={entityId} />}
        {activeTab === 'transactions' && <TransactionsTab entityId={entityId} />}
        {activeTab === 'cogs' && <COGSTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default Inventory;
