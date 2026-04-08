import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button, Card, Modal, PageHeader, Table } from '../../components/ui';
import {
  accountingApprovalDelegationsAPI,
  accountingApprovalInboxAPI,
  accountingApprovalMatricesAPI,
  billPaymentsAPI,
  billsAPI,
  entitiesAPI,
  entityRolesAPI,
  entityStaffAPI,
  journalEntriesAPI,
  paymentsAPI,
  purchaseOrdersAPI,
} from '../../services/api';

const BLANK_MATRIX = {
  entity: '',
  name: '',
  object_type: 'bill',
  description: '',
  minimum_amount: '0',
  maximum_amount: '',
  preparer_role: '',
  reviewer_role: '',
  approver_role: '',
  require_reviewer: true,
  require_approver: true,
  allow_self_review: false,
  allow_self_approval: false,
  is_active: true,
};

const BLANK_DELEGATION = {
  entity: '',
  object_type: '',
  delegator: '',
  delegate: '',
  stage: 'reviewer',
  minimum_amount: '0',
  maximum_amount: '',
  start_date: '',
  end_date: '',
  is_active: true,
  notes: '',
};

const parseList = (response) => response.data.results || response.data;

const formatError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ');
};

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';

const actionApiForItem = (item) => {
  if (item.record_type === 'journal_entry') return journalEntriesAPI;
  if (item.object_type === 'purchase_order') return purchaseOrdersAPI;
  if (item.object_type === 'bill') return billsAPI;
  if (item.object_type === 'bill_payment') return billPaymentsAPI;
  if (item.object_type === 'payment') return paymentsAPI;
  return null;
};

export default function ApprovalInbox() {
  const { entityId } = useParams();
  const location = useLocation();
  const [entities, setEntities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [inbox, setInbox] = useState({ pending: [], history: [], summary: {} });
  const [selectedEntityId, setSelectedEntityId] = useState(entityId || '');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('pending');
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);
  const [editingDelegation, setEditingDelegation] = useState(null);
  const [matrixForm, setMatrixForm] = useState(BLANK_MATRIX);
  const [delegationForm, setDelegationForm] = useState(BLANK_DELEGATION);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedEntityId ? { entity: selectedEntityId } : undefined;
      const [entityRes, roleRes, staffRes, matrixRes, delegationRes, inboxRes] = await Promise.all([
        entitiesAPI.getAll(),
        entityRolesAPI.getAll(params),
        entityStaffAPI.getAll(params),
        accountingApprovalMatricesAPI.getAll(params),
        accountingApprovalDelegationsAPI.getAll(params),
        accountingApprovalInboxAPI.getAll(params),
      ]);
      const loadedEntities = parseList(entityRes);
      setEntities(loadedEntities);
      setRoles(parseList(roleRes));
      setStaff(parseList(staffRes));
      setMatrices(parseList(matrixRes));
      setDelegations(parseList(delegationRes));
      setInbox(inboxRes.data || { pending: [], history: [], summary: {} });
      setSelectedEntityId((current) => current || entityId || String(loadedEntities[0]?.id || ''));
      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load the accounting approval inbox.'));
    }
    setLoading(false);
  }, [entityId, selectedEntityId]);

  useEffect(() => {
    load();
  }, [load]);

  const scopedRoles = useMemo(() => roles.filter((role) => String(role.entity) === String(selectedEntityId || '')), [roles, selectedEntityId]);
  const scopedStaff = useMemo(() => staff.filter((member) => String(member.entity) === String(selectedEntityId || '')), [staff, selectedEntityId]);
  const scopedMatrices = useMemo(() => matrices.filter((matrix) => String(matrix.entity) === String(selectedEntityId || '')), [matrices, selectedEntityId]);
  const scopedDelegations = useMemo(() => delegations.filter((delegation) => String(delegation.entity) === String(selectedEntityId || '')), [delegations, selectedEntityId]);

  const rows = useMemo(
    () => (activeFilter === 'history' ? inbox.history || [] : inbox.pending || []),
    [activeFilter, inbox.history, inbox.pending],
  );
  const selectedItem = useMemo(() => rows.find((row) => String(row.id) === String(selectedItemId)) || rows[0] || null, [rows, selectedItemId]);

  useEffect(() => {
    if (!rows.find((row) => String(row.id) === String(selectedItemId))) {
      setSelectedItemId(rows[0]?.id || '');
    }
  }, [rows, selectedItemId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const objectType = params.get('objectType');
    const objectId = params.get('objectId');
    if (!objectType || !objectId) {
      return;
    }

    const pendingMatch = (inbox.pending || []).find(
      (item) => String(item.object_type) === String(objectType) && String(item.object_id) === String(objectId),
    );
    if (pendingMatch) {
      setActiveFilter('pending');
      setSelectedItemId(pendingMatch.id);
      return;
    }

    const historyMatch = (inbox.history || []).find(
      (item) => String(item.object_type) === String(objectType) && String(item.object_id) === String(objectId),
    );
    if (historyMatch) {
      setActiveFilter('history');
      setSelectedItemId(historyMatch.id);
    }
  }, [inbox.history, inbox.pending, location.search]);

  const handleApprove = async (item) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    const api = actionApiForItem(item);
    if (!api) return;
    try {
      await api.approve(item.object_id, { comments });
      setMessage(`Approved ${item.title}.`);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Approval failed.'));
    }
  };

  const handleReject = async (item) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    const api = actionApiForItem(item);
    if (!api) return;
    try {
      await api.reject(item.object_id, { comments });
      setMessage(`Rejected ${item.title}.`);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Rejection failed.'));
    }
  };

  const openMatrixModal = (matrix = null) => {
    setEditingMatrix(matrix);
    setMatrixForm(matrix ? {
      entity: String(matrix.entity || selectedEntityId || ''),
      name: matrix.name || '',
      object_type: matrix.object_type || 'bill',
      description: matrix.description || '',
      minimum_amount: matrix.minimum_amount || '0',
      maximum_amount: matrix.maximum_amount || '',
      preparer_role: String(matrix.preparer_role || ''),
      reviewer_role: String(matrix.reviewer_role || ''),
      approver_role: String(matrix.approver_role || ''),
      require_reviewer: Boolean(matrix.require_reviewer),
      require_approver: Boolean(matrix.require_approver),
      allow_self_review: Boolean(matrix.allow_self_review),
      allow_self_approval: Boolean(matrix.allow_self_approval),
      is_active: Boolean(matrix.is_active),
    } : { ...BLANK_MATRIX, entity: selectedEntityId || '' });
    setShowMatrixModal(true);
  };

  const openDelegationModal = (delegation = null) => {
    setEditingDelegation(delegation);
    setDelegationForm(delegation ? {
      entity: String(delegation.entity || selectedEntityId || ''),
      object_type: delegation.object_type || '',
      delegator: String(delegation.delegator || ''),
      delegate: String(delegation.delegate || ''),
      stage: delegation.stage || 'reviewer',
      minimum_amount: delegation.minimum_amount || '0',
      maximum_amount: delegation.maximum_amount || '',
      start_date: delegation.start_date || '',
      end_date: delegation.end_date || '',
      is_active: Boolean(delegation.is_active),
      notes: delegation.notes || '',
    } : { ...BLANK_DELEGATION, entity: selectedEntityId || '' });
    setShowDelegationModal(true);
  };

  const saveMatrix = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...matrixForm,
        entity: Number(matrixForm.entity),
        preparer_role: matrixForm.preparer_role || null,
        reviewer_role: matrixForm.reviewer_role || null,
        approver_role: matrixForm.approver_role || null,
        maximum_amount: matrixForm.maximum_amount || null,
      };
      if (editingMatrix) await accountingApprovalMatricesAPI.update(editingMatrix.id, payload);
      else await accountingApprovalMatricesAPI.create(payload);
      setShowMatrixModal(false);
      setEditingMatrix(null);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save the accounting approval matrix.'));
    }
    setSaving(false);
  };

  const saveDelegation = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...delegationForm,
        entity: Number(delegationForm.entity),
        delegator: Number(delegationForm.delegator),
        delegate: Number(delegationForm.delegate),
        maximum_amount: delegationForm.maximum_amount || null,
      };
      if (editingDelegation) await accountingApprovalDelegationsAPI.update(editingDelegation.id, payload);
      else await accountingApprovalDelegationsAPI.create(payload);
      setShowDelegationModal(false);
      setEditingDelegation(null);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save the delegation.'));
    }
    setSaving(false);
  };

  const rowColumns = [
    { key: 'title', label: 'Item' },
    { key: 'object_type', label: 'Type', render: (value) => String(value || '').replaceAll('_', ' ') },
    { key: 'amount', label: 'Amount' },
    { key: 'current_stage', label: 'Stage', render: (value) => value ? String(value).replaceAll('_', ' ') : '—' },
    { key: 'requested_by_name', label: 'Prepared By' },
    { key: 'submitted_at', label: 'Submitted', render: (value) => formatDateTime(value) },
  ];

  return (
    <div className="module-page">
      <PageHeader title="Approval Inbox" subtitle="Work one queue for journals, purchase orders, bills, and payments, with delegate access and control configuration in the same surface." />
      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div> : null}
      {message ? <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{message}</div> : null}

      <Card title="Scope" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px)', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity</label>
            <select value={selectedEntityId} onChange={(event) => setSelectedEntityId(event.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">All accessible entities</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card title="Approval Queue" actions={<div style={{ display: 'flex', gap: 8 }}><Button variant={activeFilter === 'pending' ? 'primary' : 'secondary'} size="small" onClick={() => setActiveFilter('pending')}>Pending</Button><Button variant={activeFilter === 'history' ? 'primary' : 'secondary'} size="small" onClick={() => setActiveFilter('history')}>History</Button></div>}>
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Loading approval queue...</div> : <Table columns={rowColumns} data={rows} actions={(row) => (
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => setSelectedItemId(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>View</button>
              {row.can_approve && row.status !== 'approved' && row.status !== 'posted' ? <button type="button" onClick={() => handleApprove(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #86efac', background: 'transparent', cursor: 'pointer', color: '#15803d' }}>Approve</button> : null}
              {row.can_approve && row.status !== 'approved' && row.status !== 'posted' ? <button type="button" onClick={() => handleReject(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Reject</button> : null}
            </div>
          )} />}
        </Card>

        <Card title={selectedItem ? selectedItem.title : 'Approval Details'}>
          {!selectedItem ? <div style={{ color: '#64748b' }}>Select an approval item to inspect its step history and audit timeline.</div> : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#475569' }}>Type: {String(selectedItem.object_type || '').replaceAll('_', ' ')} | Stage: {selectedItem.current_stage ? String(selectedItem.current_stage).replaceAll('_', ' ') : 'Completed'}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {(selectedItem.steps || []).map((step) => (
                  <div key={step.id} style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <strong style={{ textTransform: 'capitalize' }}>{step.stage}</strong>
                      <span>{step.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Role: {step.assigned_role_name || '—'} | Actor: {step.acted_by_name || '—'}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Acted: {formatDateTime(step.acted_at)}</div>
                    {step.comments ? <div style={{ fontSize: 12, color: '#334155', marginTop: 6 }}>{step.comments}</div> : null}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {(selectedItem.change_logs || []).map((log) => (
                  <div key={log.id} style={{ borderLeft: '3px solid #0f766e', paddingLeft: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <strong style={{ textTransform: 'capitalize' }}>{String(log.action || '').replaceAll('_', ' ')}</strong>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(log.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Actor: {log.actor_name || 'System'}{log.stage ? ` | Stage: ${log.stage}` : ''}</div>
                    {log.details ? <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>{log.details}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Object Approval Matrices" actions={<Button variant="secondary" size="small" onClick={() => openMatrixModal()}>New Matrix</Button>}>
          <Table
            columns={[
              { key: 'name', label: 'Matrix' },
              { key: 'object_type', label: 'Object Type', render: (value) => String(value || '').replaceAll('_', ' ') },
              { key: 'minimum_amount', label: 'Min' },
              { key: 'maximum_amount', label: 'Max', render: (value) => value || 'No limit' },
            ]}
            data={scopedMatrices}
            actions={(row) => <button type="button" onClick={() => openMatrixModal(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button>}
          />
        </Card>

        <Card title="Object Delegations" actions={<Button variant="secondary" size="small" onClick={() => openDelegationModal()}>New Delegation</Button>}>
          <Table
            columns={[
              { key: 'delegator_name', label: 'Delegator' },
              { key: 'delegate_name', label: 'Delegate' },
              { key: 'object_type', label: 'Object Type', render: (value) => value ? String(value).replaceAll('_', ' ') : 'All supported objects' },
              { key: 'stage', label: 'Stage' },
            ]}
            data={scopedDelegations}
            actions={(row) => <button type="button" onClick={() => openDelegationModal(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button>}
          />
        </Card>
      </div>

      <Modal isOpen={showMatrixModal} onClose={() => { setShowMatrixModal(false); setEditingMatrix(null); setMatrixForm({ ...BLANK_MATRIX, entity: selectedEntityId || '' }); }} title={editingMatrix ? 'Edit Accounting Approval Matrix' : 'New Accounting Approval Matrix'} footer={<><Button variant="secondary" onClick={() => { setShowMatrixModal(false); setEditingMatrix(null); setMatrixForm({ ...BLANK_MATRIX, entity: selectedEntityId || '' }); }}>Cancel</Button><Button variant="primary" onClick={saveMatrix} disabled={saving}>{saving ? 'Saving...' : 'Save Matrix'}</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Object Type</label>
            <select value={matrixForm.object_type} onChange={(event) => setMatrixForm((current) => ({ ...current, object_type: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="purchase_order">Purchase Order</option>
              <option value="bill">Bill</option>
              <option value="bill_payment">Bill Payment</option>
              <option value="payment">Customer Payment</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Name</label>
            <input value={matrixForm.name} onChange={(event) => setMatrixForm((current) => ({ ...current, name: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Minimum Amount</label>
              <input type="number" min="0" step="0.01" value={matrixForm.minimum_amount} onChange={(event) => setMatrixForm((current) => ({ ...current, minimum_amount: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Maximum Amount</label>
              <input type="number" min="0" step="0.01" value={matrixForm.maximum_amount} onChange={(event) => setMatrixForm((current) => ({ ...current, maximum_amount: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <select value={matrixForm.preparer_role} onChange={(event) => setMatrixForm((current) => ({ ...current, preparer_role: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}><option value="">Preparer role</option>{scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
            <select value={matrixForm.reviewer_role} onChange={(event) => setMatrixForm((current) => ({ ...current, reviewer_role: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}><option value="">Reviewer role</option>{scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
            <select value={matrixForm.approver_role} onChange={(event) => setMatrixForm((current) => ({ ...current, approver_role: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}><option value="">Approver role</option>{scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDelegationModal} onClose={() => { setShowDelegationModal(false); setEditingDelegation(null); setDelegationForm({ ...BLANK_DELEGATION, entity: selectedEntityId || '' }); }} title={editingDelegation ? 'Edit Accounting Delegation' : 'New Accounting Delegation'} footer={<><Button variant="secondary" onClick={() => { setShowDelegationModal(false); setEditingDelegation(null); setDelegationForm({ ...BLANK_DELEGATION, entity: selectedEntityId || '' }); }}>Cancel</Button><Button variant="primary" onClick={saveDelegation} disabled={saving}>{saving ? 'Saving...' : 'Save Delegation'}</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <select value={delegationForm.object_type} onChange={(event) => setDelegationForm((current) => ({ ...current, object_type: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
            <option value="">All supported objects</option>
            <option value="purchase_order">Purchase Order</option>
            <option value="bill">Bill</option>
            <option value="bill_payment">Bill Payment</option>
            <option value="payment">Customer Payment</option>
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={delegationForm.delegator} onChange={(event) => setDelegationForm((current) => ({ ...current, delegator: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}><option value="">Delegator</option>{scopedStaff.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select>
            <select value={delegationForm.delegate} onChange={(event) => setDelegationForm((current) => ({ ...current, delegate: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}><option value="">Delegate</option>{scopedStaff.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input type="date" value={delegationForm.start_date} onChange={(event) => setDelegationForm((current) => ({ ...current, start_date: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            <input type="date" value={delegationForm.end_date} onChange={(event) => setDelegationForm((current) => ({ ...current, end_date: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}