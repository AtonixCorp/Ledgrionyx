import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Card, Button, Table, Modal, Input } from '../../components/ui';
import { entitiesAPI, ledgerPeriodsAPI, periodCloseChecklistsAPI, periodCloseItemsAPI } from '../../services/api';

const BASE_PATH = '/app/compliance/period-close';
const CHECKLIST_FORM = { entity: '', period: '', status: 'not_started' };
const ITEM_FORM = { task_name: '', description: '', sequence: '1', status: 'pending' };

const parseList = (response) => response.data.results || response.data;
const formatError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ');
};
const itemPayload = (form, checklistId, existingItem) => ({
  checklist: checklistId,
  task_name: form.task_name,
  description: form.description,
  sequence: Number(form.sequence || 1),
  status: form.status,
  responsible_user: existingItem?.responsible_user || null,
});

export default function PeriodClose() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [checklists, setChecklists] = useState([]);
  const [entities, setEntities] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [checklistForm, setChecklistForm] = useState(CHECKLIST_FORM);
  const [itemForm, setItemForm] = useState(ITEM_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [checklistResponse, entityResponse, periodResponse] = await Promise.all([
        periodCloseChecklistsAPI.getAll(),
        entitiesAPI.getAll(),
        ledgerPeriodsAPI.getAll(),
      ]);
      setChecklists(parseList(checklistResponse));
      setEntities(parseList(entityResponse));
      setPeriods(parseList(periodResponse));
      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load period close data.'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeChecklistModal = useCallback(() => {
    setShowChecklistModal(false);
    setSelectedChecklist(null);
    setChecklistForm(CHECKLIST_FORM);
    setViewOnly(false);
    if (location.pathname !== BASE_PATH) {
      navigate(BASE_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === `${BASE_PATH}/create`) {
      setSelectedChecklist(null);
      setChecklistForm(CHECKLIST_FORM);
      setViewOnly(false);
      setShowChecklistModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!id || !checklists.length) return;
    const match = checklists.find((checklist) => String(checklist.id) === String(id));
    if (!match) return;
    setSelectedChecklist(match);
    setChecklistForm({ entity: match.entity || '', period: match.period || '', status: match.status || 'not_started' });
    setViewOnly(location.pathname.includes('/view/'));
    setShowChecklistModal(true);
  }, [checklists, id, location.pathname]);

  const refreshSelectedChecklist = useCallback(async (checklistId) => {
    const response = await periodCloseChecklistsAPI.getById(checklistId);
    const freshChecklist = response.data;
    setSelectedChecklist(freshChecklist);
    setChecklists((current) => current.map((item) => (String(item.id) === String(checklistId) ? freshChecklist : item)));
  }, []);

  const setChecklistField = (field) => (event) => setChecklistForm((current) => ({ ...current, [field]: event.target.value }));
  const setItemField = (field) => (event) => setItemForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSaveChecklist = async () => {
    if (!checklistForm.entity || !checklistForm.period) {
      setError('Entity and period are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let response;
      if (selectedChecklist) response = await periodCloseChecklistsAPI.update(selectedChecklist.id, checklistForm);
      else response = await periodCloseChecklistsAPI.create(checklistForm);
      await load();
      navigate(`${BASE_PATH}/view/${response.data.id}`, { replace: true });
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save checklist.'));
    }
    setSaving(false);
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm('Delete this period close checklist?')) return;
    try {
      await periodCloseChecklistsAPI.delete(checklistId);
      await load();
      if (String(selectedChecklist?.id) === String(checklistId)) closeChecklistModal();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete checklist.'));
    }
  };

  const openItemModal = (item = null) => {
    setEditingItem(item);
    setItemForm(item ? { task_name: item.task_name || '', description: item.description || '', sequence: String(item.sequence || 1), status: item.status || 'pending' } : ITEM_FORM);
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!selectedChecklist || !itemForm.task_name.trim()) {
      setError('Task name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingItem) await periodCloseItemsAPI.update(editingItem.id, itemPayload(itemForm, selectedChecklist.id, editingItem));
      else await periodCloseItemsAPI.create(itemPayload(itemForm, selectedChecklist.id));
      await refreshSelectedChecklist(selectedChecklist.id);
      await load();
      setShowItemModal(false);
      setEditingItem(null);
      setItemForm(ITEM_FORM);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save close item.'));
    }
    setSaving(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this checklist item?')) return;
    try {
      await periodCloseItemsAPI.delete(itemId);
      if (selectedChecklist) await refreshSelectedChecklist(selectedChecklist.id);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete close item.'));
    }
  };

  const handleToggleItemStatus = async (item) => {
    if (!selectedChecklist) return;
    try {
      await periodCloseItemsAPI.update(item.id, {
        checklist: selectedChecklist.id,
        task_name: item.task_name,
        description: item.description,
        sequence: item.sequence,
        status: item.status === 'completed' ? 'pending' : 'completed',
        responsible_user: item.responsible_user || null,
      });
      await refreshSelectedChecklist(selectedChecklist.id);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to update item status.'));
    }
  };

  const totalItems = checklists.reduce((sum, checklist) => sum + (checklist.items?.length || 0), 0);
  const completedItems = checklists.reduce((sum, checklist) => sum + (checklist.items || []).filter((item) => item.status === 'completed').length, 0);
  const openChecklists = checklists.filter((checklist) => checklist.status !== 'completed').length;
  const lockedPeriods = periods.filter((period) => period.status === 'closed' || period.no_posting_after).length;
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const availablePeriods = periods.filter((period) => !checklistForm.entity || String(period.entity) === String(checklistForm.entity));
  const periodColumns = [
    { key: 'period_name', label: 'Period' },
    { key: 'entity', label: 'Entity', render: (value) => entities.find((entity) => String(entity.id) === String(value))?.name || '—' },
    { key: 'status', label: 'Status', render: (value) => <span className="status-badge" style={{ background: value === 'closed' ? 'var(--color-danger, #dc2626)' : 'var(--color-success, #16a34a)' }}>{value}</span> },
    { key: 'no_posting_after', label: 'No Posting After', render: (value) => value || '—' },
    { key: 'closed_at', label: 'Closed At', render: (value) => value ? new Date(value).toLocaleString() : '—' },
  ];
  const checklistColumns = [
    { key: 'period', label: 'Period', render: (value) => periods.find((period) => String(period.id) === String(value))?.period_name || value || '—' },
    { key: 'entity_name', label: 'Entity', render: (_value, row) => entities.find((entity) => String(entity.id) === String(row.entity))?.name || row.entity || '—' },
    { key: 'status', label: 'Status', render: (value) => <span className="status-badge" style={{ background: value === 'completed' ? 'var(--color-success)' : 'var(--color-warning)' }}>{value}</span> },
    { key: 'started_at', label: 'Started', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
    { key: 'completed_at', label: 'Completed', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
  ];
  const itemColumns = [
    { key: 'sequence', label: '#' },
    { key: 'task_name', label: 'Task' },
    { key: 'description', label: 'Description', render: (value) => value || '—' },
    { key: 'status', label: 'Status', render: (value) => <span className="status-badge" style={{ background: value === 'completed' ? 'var(--color-success)' : 'var(--color-warning)' }}>{value}</span> },
  ];

  return (
    <div className="module-page">
      <PageHeader title="Period Close" subtitle="Manage checklist-driven month-end and year-end closes" actions={<Button variant="primary" size="small" onClick={() => navigate(`${BASE_PATH}/create`)}>New Checklist</Button>} />

      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div> : null}

      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card className="stat-card"><div className="stat-label">Active Checklists</div><div className="stat-value">{openChecklists}</div></Card>
        <Card className="stat-card"><div className="stat-label">Completed Items</div><div className="stat-value">{completedItems}</div></Card>
        <Card className="stat-card"><div className="stat-label">Completion Rate</div><div className="stat-value">{progress}%</div></Card>
        <Card className="stat-card"><div className="stat-label">Locked Periods</div><div className="stat-value">{lockedPeriods}</div></Card>
      </div>

      <Card title="Ledger Period Locks" style={{ marginBottom: 24 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-silver-dark)' }}>Loading ledger periods...</div> : <Table columns={periodColumns} data={periods} actions={(row) => row.status === 'closed' ? null : <button type="button" onClick={async () => {
          try {
            await ledgerPeriodsAPI.close(row.id);
            await load();
          } catch (requestError) {
            setError(formatError(requestError, 'Failed to close ledger period.'));
          }
        }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Close & Lock</button>} />}
      </Card>

      <Card title="Period Close Register">
        {loading ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-silver-dark)' }}>Loading period close checklists...</div> : <Table columns={checklistColumns} data={checklists} actions={(row) => <div style={{ display: 'flex', gap: 6 }}><button type="button" onClick={() => navigate(`${BASE_PATH}/view/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>View</button><button type="button" onClick={() => navigate(`${BASE_PATH}/edit/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button><button type="button" onClick={() => handleDeleteChecklist(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Delete</button></div>} />}
      </Card>

      <Modal isOpen={showChecklistModal} onClose={closeChecklistModal} title={viewOnly ? 'Checklist Details' : selectedChecklist ? 'Edit Checklist' : 'New Checklist'} footer={viewOnly ? <Button variant="secondary" onClick={closeChecklistModal}>Close</Button> : <><Button variant="secondary" onClick={closeChecklistModal}>Cancel</Button><Button variant="primary" onClick={handleSaveChecklist} disabled={saving}>{saving ? 'Saving...' : 'Save Checklist'}</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity *</label>
            <select disabled={viewOnly} value={checklistForm.entity} onChange={setChecklistField('entity')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">Select entity</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ledger Period *</label>
            <select disabled={viewOnly} value={checklistForm.period} onChange={setChecklistField('period')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">Select ledger period</option>
              {availablePeriods.map((period) => <option key={period.id} value={period.id}>{period.period_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Checklist Status</label>
            <select disabled={viewOnly} value={checklistForm.status} onChange={setChecklistField('status')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              {['not_started', 'in_progress', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          {selectedChecklist ? <Card title="Checklist Items" style={{ marginTop: 8 }}><div style={{ marginBottom: 12 }}>{!viewOnly ? <Button variant="secondary" size="small" onClick={() => openItemModal()}>Add Task</Button> : null}</div><Table columns={itemColumns} data={selectedChecklist.items || []} actions={(row) => viewOnly ? null : <div style={{ display: 'flex', gap: 6 }}><button type="button" onClick={() => handleToggleItemStatus(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>{row.status === 'completed' ? 'Reopen' : 'Complete'}</button><button type="button" onClick={() => openItemModal(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button><button type="button" onClick={() => handleDeleteItem(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Delete</button></div>} /></Card> : null}
        </div>
      </Modal>

      <Modal isOpen={showItemModal} onClose={() => { setShowItemModal(false); setEditingItem(null); setItemForm(ITEM_FORM); }} title={editingItem ? 'Edit Close Item' : 'Add Close Item'} footer={<><Button variant="secondary" onClick={() => { setShowItemModal(false); setEditingItem(null); setItemForm(ITEM_FORM); }}>Cancel</Button><Button variant="primary" onClick={handleSaveItem} disabled={saving}>{saving ? 'Saving...' : 'Save Item'}</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Input label="Task Name *" value={itemForm.task_name} onChange={setItemField('task_name')} />
          <Input label="Description" value={itemForm.description} onChange={setItemField('description')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Sequence" type="number" min="1" value={itemForm.sequence} onChange={setItemField('sequence')} />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Status</label>
              <select value={itemForm.status} onChange={setItemField('status')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                {['pending', 'in_progress', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
