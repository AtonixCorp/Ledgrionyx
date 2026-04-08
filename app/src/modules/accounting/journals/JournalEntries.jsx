import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Modal, PageHeader, Table } from '../../../components/ui';
import {
  entitiesAPI,
  entityRolesAPI,
  entityStaffAPI,
  journalApprovalDelegationsAPI,
  journalApprovalMatricesAPI,
  journalEntriesAPI,
} from '../../../services/api';

const DEFAULT_BASE_PATH = '/app/accounting/journal-entries';

const STATUS_COLOR = {
  draft: '#6b7280',
  pending_review: '#f59e0b',
  pending_approval: '#fb7185',
  posted: '#10b981',
  rejected: '#ef4444',
  reversed: '#7c3aed',
};

const BLANK_ENTRY = {
  reference_number: '',
  description: '',
  posting_date: '',
  entry_type: 'manual',
  memo: '',
  amount_total: '',
  entity: '',
};

const BLANK_MATRIX = {
  entity: '',
  name: '',
  description: '',
  entry_type: '',
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

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const StatusBadge = ({ value }) => (
  <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[value] || '#6b7280', textTransform: 'capitalize' }}>
    {String(value || 'draft').replaceAll('_', ' ')}
  </span>
);

export default function JournalEntries({ entityIdOverride = '', basePathOverride = DEFAULT_BASE_PATH, showEntitySelector = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, entityId: routeEntityId } = useParams();
  const scopedEntityId = entityIdOverride || routeEntityId || '';
  const basePath = basePathOverride || DEFAULT_BASE_PATH;

  const [entries, setEntries] = useState([]);
  const [entities, setEntities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [controlEntityId, setControlEntityId] = useState('');

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editingMatrix, setEditingMatrix] = useState(null);
  const [editingDelegation, setEditingDelegation] = useState(null);

  const [entryForm, setEntryForm] = useState(BLANK_ENTRY);
  const [matrixForm, setMatrixForm] = useState(BLANK_MATRIX);
  const [delegationForm, setDelegationForm] = useState(BLANK_DELEGATION);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = scopedEntityId ? { entity: scopedEntityId } : undefined;
      const [entryResponse, entityResponse, roleResponse, staffResponse, matrixResponse, delegationResponse] = await Promise.all([
        journalEntriesAPI.getAll(params),
        entitiesAPI.getAll(),
        entityRolesAPI.getAll(params),
        entityStaffAPI.getAll(params),
        journalApprovalMatricesAPI.getAll(params),
        journalApprovalDelegationsAPI.getAll(params),
      ]);
      const loadedEntities = parseList(entityResponse);
      setEntries(parseList(entryResponse));
      setEntities(loadedEntities);
      setRoles(parseList(roleResponse));
      setStaff(parseList(staffResponse));
      setMatrices(parseList(matrixResponse));
      setDelegations(parseList(delegationResponse));
      setControlEntityId((current) => current || String(scopedEntityId || loadedEntities[0]?.id || ''));
      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load journal controls.'));
    }
    setLoading(false);
  }, [scopedEntityId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const isCreatePath = location.pathname === `${basePath}/create`;
    const isEditPath = location.pathname.includes('/edit/');
    const isViewPath = location.pathname.includes('/view/');

    if (!isCreatePath && !isEditPath && !isViewPath) {
      setShowEntryModal(false);
      setViewOnly(false);
      setEditItem(null);
      return;
    }

    if (isCreatePath) {
      setEditItem(null);
      setViewOnly(false);
      setEntryForm({ ...BLANK_ENTRY, entity: controlEntityId || '' });
      setShowEntryModal(true);
      setError('');
    }
  }, [basePath, controlEntityId, location.pathname]);

  useEffect(() => {
    if (!id || !entries.length) return;
    const match = entries.find((entry) => String(entry.id) === String(id));
    if (!match) return;

    setEditItem(match);
    setViewOnly(location.pathname.includes('/view/'));
    setEntryForm({
      reference_number: match.reference_number || '',
      description: match.description || '',
      posting_date: match.posting_date || '',
      entry_type: match.entry_type || 'manual',
      memo: match.memo || '',
      amount_total: match.amount_total || '',
      entity: String(match.entity || ''),
    });
    setShowEntryModal(true);
  }, [entries, id, location.pathname]);

  const closeEntryModal = useCallback(() => {
    setShowEntryModal(false);
    setViewOnly(false);
    setEditItem(null);
    setEntryForm({ ...BLANK_ENTRY, entity: controlEntityId || '' });
    if (location.pathname !== basePath) {
      navigate(basePath, { replace: true });
    }
  }, [basePath, controlEntityId, location.pathname, navigate]);

  const scopedRoles = useMemo(
    () => roles.filter((role) => String(role.entity) === String(controlEntityId || '')),
    [controlEntityId, roles],
  );

  const scopedStaff = useMemo(
    () => staff.filter((member) => String(member.entity) === String(controlEntityId || '')),
    [controlEntityId, staff],
  );

  const scopedMatrices = useMemo(
    () => matrices.filter((matrix) => String(matrix.entity) === String(controlEntityId || '')),
    [controlEntityId, matrices],
  );

  const scopedDelegations = useMemo(
    () => delegations.filter((delegation) => String(delegation.entity) === String(controlEntityId || '')),
    [controlEntityId, delegations],
  );

  const stats = useMemo(() => ({
    total: entries.length,
    pendingReview: entries.filter((entry) => entry.status === 'pending_review').length,
    pendingApproval: entries.filter((entry) => entry.status === 'pending_approval').length,
    posted: entries.filter((entry) => entry.status === 'posted').length,
    rejected: entries.filter((entry) => entry.status === 'rejected').length,
  }), [entries]);

  const setEntryField = (field) => (event) => setEntryForm((current) => ({ ...current, [field]: event.target.value }));
  const setMatrixField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setMatrixForm((current) => ({ ...current, [field]: value }));
  };
  const setDelegationField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setDelegationForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveEntry = async () => {
    if (!entryForm.entity) { setError('Entity is required.'); return; }
    if (!entryForm.reference_number.trim()) { setError('Reference number is required.'); return; }
    if (!entryForm.description.trim()) { setError('Description is required.'); return; }
    if (!entryForm.posting_date) { setError('Posting date is required.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...entryForm,
        amount_total: entryForm.amount_total || '0',
        entity: Number(entryForm.entity),
      };
      const response = editItem
        ? await journalEntriesAPI.update(editItem.id, payload)
        : await journalEntriesAPI.create(payload);
      await load();
      navigate(`${basePath}/view/${response.data.id}`, { replace: true });
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save journal entry.'));
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await journalEntriesAPI.delete(entryId);
      await load();
      if (String(editItem?.id) === String(entryId)) {
        closeEntryModal();
      }
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete journal entry.'));
    }
  };

  const handleSubmit = async (entryId) => {
    try {
      await journalEntriesAPI.submit(entryId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to submit journal entry.'));
    }
  };

  const handleApprove = async (entryId) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try {
      await journalEntriesAPI.approve(entryId, { comments });
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to approve journal entry.'));
    }
  };

  const handleReject = async (entryId) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try {
      await journalEntriesAPI.reject(entryId, { comments });
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to reject journal entry.'));
    }
  };

  const handleReverse = async (entryId) => {
    if (!window.confirm('Create a reversal journal entry for this posted journal?')) return;
    try {
      await journalEntriesAPI.reverse(entryId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to reverse journal entry.'));
    }
  };

  const openMatrixModal = (matrix = null) => {
    setEditingMatrix(matrix);
    setMatrixForm(matrix ? {
      entity: String(matrix.entity || controlEntityId || ''),
      name: matrix.name || '',
      description: matrix.description || '',
      entry_type: matrix.entry_type || '',
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
    } : { ...BLANK_MATRIX, entity: controlEntityId || '' });
    setShowMatrixModal(true);
  };

  const handleSaveMatrix = async () => {
    if (!matrixForm.entity || !matrixForm.name.trim()) {
      setError('Matrix entity and name are required.');
      return;
    }
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
      if (editingMatrix) await journalApprovalMatricesAPI.update(editingMatrix.id, payload);
      else await journalApprovalMatricesAPI.create(payload);
      await load();
      setShowMatrixModal(false);
      setEditingMatrix(null);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save approval matrix.'));
    }
    setSaving(false);
  };

  const handleDeleteMatrix = async (matrixId) => {
    if (!window.confirm('Delete this approval matrix?')) return;
    try {
      await journalApprovalMatricesAPI.delete(matrixId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete approval matrix.'));
    }
  };

  const openDelegationModal = (delegation = null) => {
    setEditingDelegation(delegation);
    setDelegationForm(delegation ? {
      entity: String(delegation.entity || controlEntityId || ''),
      delegator: String(delegation.delegator || ''),
      delegate: String(delegation.delegate || ''),
      stage: delegation.stage || 'reviewer',
      minimum_amount: delegation.minimum_amount || '0',
      maximum_amount: delegation.maximum_amount || '',
      start_date: delegation.start_date || '',
      end_date: delegation.end_date || '',
      is_active: Boolean(delegation.is_active),
      notes: delegation.notes || '',
    } : { ...BLANK_DELEGATION, entity: controlEntityId || '' });
    setShowDelegationModal(true);
  };

  const handleSaveDelegation = async () => {
    if (!delegationForm.entity || !delegationForm.delegator || !delegationForm.delegate) {
      setError('Delegation entity, delegator, and delegate are required.');
      return;
    }
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
      if (editingDelegation) await journalApprovalDelegationsAPI.update(editingDelegation.id, payload);
      else await journalApprovalDelegationsAPI.create(payload);
      await load();
      setShowDelegationModal(false);
      setEditingDelegation(null);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save delegation of authority.'));
    }
    setSaving(false);
  };

  const handleDeleteDelegation = async (delegationId) => {
    if (!window.confirm('Delete this delegation of authority?')) return;
    try {
      await journalApprovalDelegationsAPI.delete(delegationId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete delegation.'));
    }
  };

  const entryColumns = [
    { key: 'reference_number', label: 'Reference', render: (value) => <code style={{ fontSize: 12, background: 'var(--color-bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>{value}</code> },
    { key: 'description', label: 'Description', render: (value) => <span style={{ fontSize: 13 }}>{value}</span> },
    { key: 'amount_total', label: 'Amount', render: (value) => value || '0.00' },
    { key: 'posting_date', label: 'Date' },
    { key: 'current_pending_stage', label: 'Current Stage', render: (value) => value ? String(value).replaceAll('_', ' ') : '—' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge value={value} /> },
  ];

  const matrixColumns = [
    { key: 'name', label: 'Matrix' },
    { key: 'entry_type', label: 'Entry Type', render: (value) => value || 'All' },
    { key: 'minimum_amount', label: 'Min Amount' },
    { key: 'maximum_amount', label: 'Max Amount', render: (value) => value || 'No limit' },
    { key: 'reviewer_role_name', label: 'Reviewer Role', render: (value) => value || '—' },
    { key: 'approver_role_name', label: 'Approver Role', render: (value) => value || '—' },
  ];

  const delegationColumns = [
    { key: 'delegator_name', label: 'Delegator' },
    { key: 'delegate_name', label: 'Delegate' },
    { key: 'stage', label: 'Stage', render: (value) => String(value).replaceAll('_', ' ') },
    { key: 'minimum_amount', label: 'Min Amount' },
    { key: 'maximum_amount', label: 'Max Amount', render: (value) => value || 'No limit' },
    { key: 'end_date', label: 'Ends' },
  ];

  return (
    <div className="journals-page">
      <PageHeader
        title="Journal Entries"
        subtitle="Run preparer → reviewer → approver workflows with role-based rules, delegated authority, and immutable change history."
        actions={<Button variant="primary" onClick={() => navigate(`${basePath}/create`)}>+ New Journal Entry</Button>}
      />

      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 16px', borderRadius: 8, marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card><div style={{ fontSize: 12, color: '#64748b' }}>Total Entries</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div></Card>
        <Card><div style={{ fontSize: 12, color: '#f59e0b' }}>Pending Review</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.pendingReview}</div></Card>
        <Card><div style={{ fontSize: 12, color: '#fb7185' }}>Pending Approval</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.pendingApproval}</div></Card>
        <Card><div style={{ fontSize: 12, color: '#10b981' }}>Posted</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.posted}</div></Card>
        <Card><div style={{ fontSize: 12, color: '#ef4444' }}>Rejected</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.rejected}</div></Card>
      </div>

      {showEntitySelector ? (
        <Card title="Control Scope" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 320px)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity for Approval Controls</label>
              <select value={controlEntityId} onChange={(event) => setControlEntityId(event.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
                <option value="">Select entity</option>
                {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
              </select>
            </div>
          </div>
        </Card>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card title="Approval Matrix" actions={<Button variant="secondary" size="small" onClick={() => openMatrixModal()}>New Matrix</Button>}>
          {loading ? <div style={{ textAlign: 'center', padding: 28, color: '#64748b' }}>Loading matrices...</div> : <Table columns={matrixColumns} data={scopedMatrices} actions={(row) => (
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => openMatrixModal(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button>
              <button type="button" onClick={() => handleDeleteMatrix(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
            </div>
          )} />}
        </Card>

        <Card title="Delegation Of Authority" actions={<Button variant="secondary" size="small" onClick={() => openDelegationModal()}>New Delegation</Button>}>
          {loading ? <div style={{ textAlign: 'center', padding: 28, color: '#64748b' }}>Loading delegations...</div> : <Table columns={delegationColumns} data={scopedDelegations} actions={(row) => (
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => openDelegationModal(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button>
              <button type="button" onClick={() => handleDeleteDelegation(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Delete</button>
            </div>
          )} />}
        </Card>
      </div>

      <Card title="Journal Register">
        {loading ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-silver-dark)' }}>Loading journal entries...</div>
        : <Table columns={entryColumns} data={entries} actions={(row) => (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => navigate(`${basePath}/view/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>View</button>
              {['draft', 'rejected'].includes(row.status) ? <button type="button" onClick={() => navigate(`${basePath}/edit/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button> : null}
              {['draft', 'rejected'].includes(row.status) ? <button type="button" onClick={() => handleSubmit(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #c084fc', background: 'transparent', cursor: 'pointer', color: '#7c3aed' }}>Submit</button> : null}
              {['pending_review', 'pending_approval'].includes(row.status) ? <button type="button" onClick={() => handleApprove(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #86efac', background: 'transparent', cursor: 'pointer', color: '#15803d' }}>Approve Step</button> : null}
              {['pending_review', 'pending_approval'].includes(row.status) ? <button type="button" onClick={() => handleReject(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Reject</button> : null}
              {row.status === 'posted' ? <button type="button" onClick={() => handleReverse(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fdba74', background: 'transparent', cursor: 'pointer', color: '#c2410c' }}>Reverse</button> : null}
              {['draft', 'rejected'].includes(row.status) ? <button type="button" onClick={() => handleDeleteEntry(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Delete</button> : null}
            </div>
          )} />}
      </Card>

      <Modal
        isOpen={showEntryModal}
        onClose={closeEntryModal}
        title={viewOnly ? 'Journal Entry Details' : editItem ? 'Edit Journal Entry' : 'New Journal Entry'}
        footer={viewOnly
          ? <Button variant="secondary" onClick={closeEntryModal}>Close</Button>
          : <><Button variant="secondary" onClick={closeEntryModal}>Cancel</Button><Button variant="primary" onClick={handleSaveEntry} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity *</label>
            <select disabled={viewOnly} value={entryForm.entity} onChange={setEntryField('entity')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6 }}>
              <option value="">Select entity</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
            </select>
          </div>
          <Input label="Reference Number *" value={entryForm.reference_number} onChange={setEntryField('reference_number')} disabled={viewOnly} />
          <Input label="Description *" value={entryForm.description} onChange={setEntryField('description')} disabled={viewOnly} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Posting Date *</label>
              <input disabled={viewOnly} type="date" value={entryForm.posting_date} onChange={setEntryField('posting_date')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Amount</label>
              <input disabled={viewOnly} type="number" min="0" step="0.01" value={entryForm.amount_total} onChange={setEntryField('amount_total')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entry Type</label>
            <select disabled={viewOnly} value={entryForm.entry_type} onChange={setEntryField('entry_type')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6 }}>
              {['manual', 'automated', 'reversal', 'adjusting'].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Memo</label>
            <textarea disabled={viewOnly} value={entryForm.memo} onChange={setEntryField('memo')} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6 }} />
          </div>

          {viewOnly && editItem ? (
            <>
              <Card title="Workflow Summary">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div><div style={{ fontSize: 12, color: '#64748b' }}>Status</div><div><StatusBadge value={editItem.status} /></div></div>
                  <div><div style={{ fontSize: 12, color: '#64748b' }}>Current Stage</div><div>{editItem.current_pending_stage ? String(editItem.current_pending_stage).replaceAll('_', ' ') : 'Completed'}</div></div>
                  <div><div style={{ fontSize: 12, color: '#64748b' }}>Submitted</div><div>{formatDateTime(editItem.submitted_at)}</div></div>
                  <div><div style={{ fontSize: 12, color: '#64748b' }}>Final Approval</div><div>{formatDateTime(editItem.approved_at)}</div></div>
                </div>
              </Card>

              <Card title="Approval Steps">
                <div style={{ display: 'grid', gap: 10 }}>
                  {(editItem.approval_steps || []).map((step) => (
                    <div key={step.id} style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                        <strong style={{ textTransform: 'capitalize' }}>{step.stage}</strong>
                        <StatusBadge value={step.status} />
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Role: {step.assigned_role_name || '—'} | Staff: {step.assigned_staff_name || '—'} | Actor: {step.acted_by_name || '—'}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Acted: {formatDateTime(step.acted_at)}</div>
                      {step.comments ? <div style={{ fontSize: 12, color: '#334155', marginTop: 6 }}>{step.comments}</div> : null}
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Change Management Log">
                <div style={{ display: 'grid', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
                  {(editItem.change_logs || []).map((log) => (
                    <div key={log.id} style={{ borderLeft: '3px solid #0f766e', paddingLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <strong style={{ textTransform: 'capitalize' }}>{String(log.action).replaceAll('_', ' ')}</strong>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(log.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Actor: {log.actor_name || 'System'}{log.stage ? ` | Stage: ${log.stage}` : ''}</div>
                      {log.details ? <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>{log.details}</div> : null}
                      {(Object.keys(log.old_values || {}).length || Object.keys(log.new_values || {}).length) ? <pre style={{ marginTop: 8, padding: 10, background: '#f8fafc', borderRadius: 6, fontSize: 11, overflowX: 'auto' }}>{JSON.stringify({ old: log.old_values, new: log.new_values }, null, 2)}</pre> : null}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={showMatrixModal}
        onClose={() => { setShowMatrixModal(false); setEditingMatrix(null); setMatrixForm({ ...BLANK_MATRIX, entity: controlEntityId || '' }); }}
        title={editingMatrix ? 'Edit Approval Matrix' : 'New Approval Matrix'}
        footer={<><Button variant="secondary" onClick={() => { setShowMatrixModal(false); setEditingMatrix(null); setMatrixForm({ ...BLANK_MATRIX, entity: controlEntityId || '' }); }}>Cancel</Button><Button variant="primary" onClick={handleSaveMatrix} disabled={saving}>{saving ? 'Saving...' : 'Save Matrix'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <Input label="Matrix Name *" value={matrixForm.name} onChange={setMatrixField('name')} />
          <Input label="Description" value={matrixForm.description} onChange={setMatrixField('description')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entry Type</label>
              <select value={matrixForm.entry_type} onChange={setMatrixField('entry_type')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">All</option>
                {['manual', 'automated', 'reversal', 'adjusting'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <Input label="Minimum Amount" type="number" min="0" step="0.01" value={matrixForm.minimum_amount} onChange={setMatrixField('minimum_amount')} />
            <Input label="Maximum Amount" type="number" min="0" step="0.01" value={matrixForm.maximum_amount} onChange={setMatrixField('maximum_amount')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Preparer Role</label>
              <select value={matrixForm.preparer_role} onChange={setMatrixField('preparer_role')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Optional</option>
                {scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reviewer Role</label>
              <select value={matrixForm.reviewer_role} onChange={setMatrixField('reviewer_role')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Optional</option>
                {scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Approver Role</label>
              <select value={matrixForm.approver_role} onChange={setMatrixField('approver_role')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Optional</option>
                {scopedRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))', gap: 10 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={matrixForm.require_reviewer} onChange={setMatrixField('require_reviewer')} /> Require reviewer</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={matrixForm.require_approver} onChange={setMatrixField('require_approver')} /> Require approver</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={matrixForm.allow_self_review} onChange={setMatrixField('allow_self_review')} /> Allow self-review</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={matrixForm.allow_self_approval} onChange={setMatrixField('allow_self_approval')} /> Allow self-approval</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={matrixForm.is_active} onChange={setMatrixField('is_active')} /> Matrix active</label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDelegationModal}
        onClose={() => { setShowDelegationModal(false); setEditingDelegation(null); setDelegationForm({ ...BLANK_DELEGATION, entity: controlEntityId || '' }); }}
        title={editingDelegation ? 'Edit Delegation' : 'New Delegation'}
        footer={<><Button variant="secondary" onClick={() => { setShowDelegationModal(false); setEditingDelegation(null); setDelegationForm({ ...BLANK_DELEGATION, entity: controlEntityId || '' }); }}>Cancel</Button><Button variant="primary" onClick={handleSaveDelegation} disabled={saving}>{saving ? 'Saving...' : 'Save Delegation'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Delegator</label>
              <select value={delegationForm.delegator} onChange={setDelegationField('delegator')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Select delegator</option>
                {scopedStaff.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.user_name || member.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Delegate</label>
              <select value={delegationForm.delegate} onChange={setDelegationField('delegate')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Select delegate</option>
                {scopedStaff.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.user_name || member.email}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Stage</label>
              <select value={delegationForm.stage} onChange={setDelegationField('stage')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="reviewer">Reviewer</option>
                <option value="approver">Approver</option>
              </select>
            </div>
            <Input label="Minimum Amount" type="number" min="0" step="0.01" value={delegationForm.minimum_amount} onChange={setDelegationField('minimum_amount')} />
            <Input label="Maximum Amount" type="number" min="0" step="0.01" value={delegationForm.maximum_amount} onChange={setDelegationField('maximum_amount')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Start Date</label>
              <input type="date" value={delegationForm.start_date} onChange={setDelegationField('start_date')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>End Date</label>
              <input type="date" value={delegationForm.end_date} onChange={setDelegationField('end_date')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Notes</label>
            <textarea value={delegationForm.notes} onChange={setDelegationField('notes')} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={delegationForm.is_active} onChange={setDelegationField('is_active')} /> Delegation active</label>
        </div>
      </Modal>
    </div>
  );
}