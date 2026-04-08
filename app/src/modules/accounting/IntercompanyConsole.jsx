import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Modal, PageHeader, Table } from '../../components/ui';
import {
  consolidationsAPI,
  entitiesAPI,
  intercompanyEliminationsAPI,
  intercompanyTransactionsAPI,
} from '../../services/api';

const BLANK_TRANSACTION_FORM = {
  source_entity: '',
  destination_entity: '',
  transaction_type: 'invoice',
  transaction_date: '',
  due_date: '',
  currency: 'USD',
  amount: '',
  transfer_pricing_markup_percent: '0',
  description: '',
  notes: '',
  auto_post: true,
};

const parseList = (response) => response.data?.results || response.data || [];

const formatError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(' | ');
};

const formatMoney = (value, currency = 'USD') => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '—');
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const humanize = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());

function DocumentLink({ to, children }) {
  if (!to) {
    return <span>{children}</span>;
  }
  return <Link to={to} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{children}</Link>;
}

export default function IntercompanyConsole({ entityIdOverride = '', showEntitySelector = true }) {
  const routeParams = useParams();
  const routeEntityId = routeParams.entityId;
  const scopedEntityId = entityIdOverride || routeEntityId || '';

  const [entities, setEntities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [consolidations, setConsolidations] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState(scopedEntityId);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [selectedConsolidationId, setSelectedConsolidationId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState(BLANK_TRANSACTION_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningConsolidation, setRunningConsolidation] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const entityParams = scopedEntityId ? undefined : undefined;
      const [entityRes, transactionRes, consolidationRes] = await Promise.all([
        entitiesAPI.getAll(entityParams),
        intercompanyTransactionsAPI.getAll(selectedEntityId ? { entity: selectedEntityId } : {}),
        consolidationsAPI.getAll(),
      ]);
      const loadedEntities = parseList(entityRes);
      const loadedTransactions = parseList(transactionRes);
      const loadedConsolidations = parseList(consolidationRes);

      setEntities(loadedEntities);
      setTransactions(loadedTransactions);
      setConsolidations(loadedConsolidations);

      const resolvedEntityId = scopedEntityId || selectedEntityId || String(loadedEntities[0]?.id || '');
      if (resolvedEntityId !== selectedEntityId) {
        setSelectedEntityId(resolvedEntityId);
      }
      setSelectedTransactionId((current) => current || String(loadedTransactions[0]?.id || ''));

      const scopedConsolidations = loadedConsolidations.filter((item) => {
        if (!resolvedEntityId) return true;
        return (item.entities || []).some((entity) => String(entity.entity) === String(resolvedEntityId));
      });
      const nextConsolidationId = selectedConsolidationId || String(scopedConsolidations[0]?.id || '');
      setSelectedConsolidationId(nextConsolidationId);

      if (nextConsolidationId) {
        const eliminationRes = await intercompanyEliminationsAPI.getAll({ consolidation: nextConsolidationId });
        setEliminations(parseList(eliminationRes));
      } else {
        setEliminations([]);
      }

      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load the intercompany console.'));
    }
    setLoading(false);
  }, [scopedEntityId, selectedConsolidationId, selectedEntityId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (scopedEntityId) {
      setSelectedEntityId(scopedEntityId);
    }
  }, [scopedEntityId]);

  const visibleEntities = useMemo(() => {
    if (scopedEntityId) {
      return entities.filter((entity) => String(entity.id) === String(scopedEntityId));
    }
    return entities;
  }, [entities, scopedEntityId]);

  const visibleConsolidations = useMemo(() => consolidations.filter((item) => {
    if (!selectedEntityId) return true;
    return (item.entities || []).some((entity) => String(entity.entity) === String(selectedEntityId));
  }), [consolidations, selectedEntityId]);

  const selectedTransaction = useMemo(
    () => transactions.find((item) => String(item.id) === String(selectedTransactionId)) || transactions[0] || null,
    [transactions, selectedTransactionId],
  );

  const selectedConsolidation = useMemo(
    () => visibleConsolidations.find((item) => String(item.id) === String(selectedConsolidationId)) || visibleConsolidations[0] || null,
    [selectedConsolidationId, visibleConsolidations],
  );

  useEffect(() => {
    if (!transactions.find((item) => String(item.id) === String(selectedTransactionId))) {
      setSelectedTransactionId(String(transactions[0]?.id || ''));
    }
  }, [transactions, selectedTransactionId]);

  useEffect(() => {
    if (!visibleConsolidations.find((item) => String(item.id) === String(selectedConsolidationId))) {
      setSelectedConsolidationId(String(visibleConsolidations[0]?.id || ''));
    }
  }, [selectedConsolidationId, visibleConsolidations]);

  useEffect(() => {
    const fetchEliminations = async () => {
      if (!selectedConsolidationId) {
        setEliminations([]);
        return;
      }
      try {
        const response = await intercompanyEliminationsAPI.getAll({ consolidation: selectedConsolidationId });
        setEliminations(parseList(response));
      } catch (requestError) {
        setError(formatError(requestError, 'Failed to load intercompany eliminations.'));
      }
    };
    fetchEliminations();
  }, [selectedConsolidationId]);

  const openCreateModal = () => {
    const baseEntityId = selectedEntityId || visibleEntities[0]?.id || '';
    const otherEntityId = visibleEntities.find((entity) => String(entity.id) !== String(baseEntityId))?.id || '';
    setTransactionForm({
      ...BLANK_TRANSACTION_FORM,
      source_entity: String(baseEntityId || ''),
      destination_entity: String(otherEntityId || ''),
      currency: visibleEntities.find((entity) => String(entity.id) === String(baseEntityId))?.local_currency || 'USD',
      transaction_date: new Date().toISOString().slice(0, 10),
      due_date: new Date().toISOString().slice(0, 10),
    });
    setShowCreateModal(true);
  };

  const handleCreateTransaction = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        source_entity: Number(transactionForm.source_entity),
        destination_entity: Number(transactionForm.destination_entity),
        transaction_type: transactionForm.transaction_type,
        transaction_date: transactionForm.transaction_date,
        due_date: transactionForm.due_date || null,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transfer_pricing_markup_percent: transactionForm.transfer_pricing_markup_percent || '0',
        description: transactionForm.description,
        notes: transactionForm.notes,
        auto_post: transactionForm.auto_post,
      };
      const response = await intercompanyTransactionsAPI.create(payload);
      setMessage(`Created ${humanize(response.data.transaction_type)} ${response.data.reference_number}.`);
      setShowCreateModal(false);
      setSelectedTransactionId(String(response.data.id));
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to create the intercompany transaction.'));
    }
    setSaving(false);
  };

  const handlePostTransaction = async (transactionId) => {
    try {
      await intercompanyTransactionsAPI.post(transactionId);
      setMessage('Intercompany transaction posted. Mirrored documents and journals were generated.');
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to post the intercompany transaction.'));
    }
  };

  const handleRunConsolidation = async () => {
    if (!selectedConsolidation) return;
    setRunningConsolidation(true);
    setError('');
    try {
      const response = await consolidationsAPI.runConsolidation(selectedConsolidation.id);
      setMessage(`Ran consolidation ${response.data.name}. Intercompany eliminations refreshed.`);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to run consolidation.'));
    }
    setRunningConsolidation(false);
  };

  const transactionRows = transactions.map((item) => ({
    ...item,
    source_destination: `${item.source_entity_name} -> ${item.destination_entity_name}`,
  }));

  const selectedEntityName = visibleEntities.find((entity) => String(entity.id) === String(selectedEntityId))?.name;
  const baseEntityPath = selectedTransaction ? `/enterprise/entity/${selectedTransaction.source_entity || selectedEntityId}` : '';
  const destinationEntityPath = selectedTransaction ? `/enterprise/entity/${selectedTransaction.destination_entity}` : '';

  return (
    <div className="module-page">
      <PageHeader
        title="Intercompany Console"
        subtitle="Create mirrored intercompany invoices or loans, inspect the propagated journals, and review consolidation eliminations from one accounting surface."
      />

      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div> : null}
      {message ? <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{message}</div> : null}

      <Card title="Scope" style={{ marginBottom: 24 }} actions={<Button variant="primary" size="small" onClick={openCreateModal}>New Intercompany Transaction</Button>}>
        <div style={{ display: 'grid', gridTemplateColumns: showEntitySelector && !scopedEntityId ? 'minmax(220px, 320px) minmax(220px, 320px)' : 'minmax(220px, 320px)', gap: 12 }}>
          {showEntitySelector && !scopedEntityId ? (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity</label>
              <select value={selectedEntityId} onChange={(event) => setSelectedEntityId(event.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">All accessible entities</option>
                {visibleEntities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
              </select>
            </div>
          ) : null}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Consolidation</label>
            <select value={selectedConsolidationId} onChange={(event) => setSelectedConsolidationId(event.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">No consolidation selected</option>
              {visibleConsolidations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card title="Intercompany Transactions" actions={selectedTransaction?.status === 'draft' ? <Button variant="secondary" size="small" onClick={() => handlePostTransaction(selectedTransaction.id)}>Post Selected</Button> : null}>
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Loading intercompany activity...</div> : (
            <Table
              columns={[
                { key: 'reference_number', label: 'Reference' },
                { key: 'transaction_type', label: 'Type', render: (value) => humanize(value) },
                { key: 'source_destination', label: 'Flow' },
                { key: 'amount', label: 'Amount', render: (value, row) => formatMoney(value, row.currency) },
                { key: 'status', label: 'Status', render: (value) => humanize(value) },
                { key: 'posted_at', label: 'Posted', render: (value) => formatDateTime(value) },
              ]}
              data={transactionRows}
              actions={(row) => (
                <button type="button" onClick={() => setSelectedTransactionId(String(row.id))} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>
                  View
                </button>
              )}
            />
          )}
        </Card>

        <Card title={selectedTransaction ? selectedTransaction.reference_number : 'Mirrored Output'}>
          {!selectedTransaction ? <div style={{ color: '#64748b' }}>Select a transaction to inspect the mirrored invoice, bill, loan, journals, and elimination entries.</div> : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {humanize(selectedTransaction.transaction_type)} | {selectedTransaction.source_entity_name} -> {selectedTransaction.destination_entity_name} | {formatMoney(selectedTransaction.amount, selectedTransaction.currency)}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>Mirrored Documents</strong>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                    <div>Source invoice: {selectedTransaction.source_invoice_number || '—'}</div>
                    <div>Destination bill: {selectedTransaction.destination_bill_number || '—'}</div>
                    <div>Destination loan: {selectedTransaction.destination_loan_label || '—'}</div>
                    <div>Source journal entry ID: {selectedTransaction.source_journal_entry || '—'}</div>
                    <div>Destination journal entry ID: {selectedTransaction.destination_journal_entry || '—'}</div>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>Routing</strong>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                    <div><DocumentLink to={baseEntityPath ? `${baseEntityPath}/accounts-receivable` : ''}>Open source entity receivables</DocumentLink></div>
                    <div><DocumentLink to={destinationEntityPath ? `${destinationEntityPath}/accounts-payable` : ''}>Open destination entity payables</DocumentLink></div>
                    <div><DocumentLink to={baseEntityPath ? `${baseEntityPath}/journal-entries` : ''}>Open source entity journals</DocumentLink></div>
                    <div><DocumentLink to={destinationEntityPath ? `${destinationEntityPath}/journal-entries` : ''}>Open destination entity journals</DocumentLink></div>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>Elimination Output</strong>
                  {(selectedTransaction.elimination_entries || []).length === 0 ? (
                    <div style={{ fontSize: 13, color: '#64748b' }}>No elimination entries have been generated for this transaction yet. Run a consolidation that includes both entities.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {selectedTransaction.elimination_entries.map((entry) => (
                        <div key={entry.id} style={{ borderLeft: '3px solid #0f766e', paddingLeft: 10 }}>
                          <div style={{ fontWeight: 600 }}>{humanize(entry.elimination_type)} — {formatMoney(entry.amount, entry.currency)}</div>
                          <div style={{ fontSize: 12, color: '#475569' }}>{entry.source_entity_name} -> {entry.destination_entity_name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card
          title={selectedConsolidation ? `Consolidation Review: ${selectedConsolidation.name}` : 'Consolidation Review'}
          actions={selectedConsolidation ? <Button variant="primary" size="small" onClick={handleRunConsolidation} disabled={runningConsolidation}>{runningConsolidation ? 'Running...' : 'Run Consolidation'}</Button> : null}
        >
          {!selectedConsolidation ? <div style={{ color: '#64748b' }}>Select a consolidation to review elimination effects and rerun adjustments.</div> : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                Status: {humanize(selectedConsolidation.status)} | Date: {formatDate(selectedConsolidation.consolidation_date)} | Scope: {selectedEntityName || selectedConsolidation.organization_name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 12 }}>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Revenue</div>
                  <div style={{ fontWeight: 700 }}>{formatMoney(selectedConsolidation.consolidated_pnl?.revenue, selectedConsolidation.reporting_currency)}</div>
                </div>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Expenses</div>
                  <div style={{ fontWeight: 700 }}>{formatMoney(selectedConsolidation.consolidated_pnl?.expenses, selectedConsolidation.reporting_currency)}</div>
                </div>
                <div style={{ border: '1px solid var(--border-color-default)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Equity</div>
                  <div style={{ fontWeight: 700 }}>{formatMoney(selectedConsolidation.shareholders_equity, selectedConsolidation.reporting_currency)}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                Elimination totals: Revenue/Expense {formatMoney(selectedConsolidation.adjustments?.intercompany_eliminations?.revenue_expense, selectedConsolidation.reporting_currency)} | Receivable/Payable {formatMoney(selectedConsolidation.adjustments?.intercompany_eliminations?.receivable_payable, selectedConsolidation.reporting_currency)} | Loan balance {formatMoney(selectedConsolidation.adjustments?.intercompany_eliminations?.loan_balance, selectedConsolidation.reporting_currency)}
              </div>
            </div>
          )}
        </Card>

        <Card title="Elimination Entries">
          <Table
            columns={[
              { key: 'transaction_reference', label: 'Transaction' },
              { key: 'elimination_type', label: 'Type', render: (value) => humanize(value) },
              { key: 'source_entity_name', label: 'Source' },
              { key: 'destination_entity_name', label: 'Destination' },
              { key: 'amount', label: 'Amount', render: (value, row) => formatMoney(value, row.currency) },
            ]}
            data={eliminations}
          />
        </Card>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setTransactionForm(BLANK_TRANSACTION_FORM); }}
        title="New Intercompany Transaction"
        footer={<><Button variant="secondary" onClick={() => { setShowCreateModal(false); setTransactionForm(BLANK_TRANSACTION_FORM); }}>Cancel</Button><Button variant="primary" onClick={handleCreateTransaction} disabled={saving}>{saving ? 'Saving...' : 'Create Transaction'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Source entity</label>
              <select value={transactionForm.source_entity} onChange={(event) => setTransactionForm((current) => ({ ...current, source_entity: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Select entity</option>
                {visibleEntities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Destination entity</label>
              <select value={transactionForm.destination_entity} onChange={(event) => setTransactionForm((current) => ({ ...current, destination_entity: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="">Select entity</option>
                {visibleEntities.filter((entity) => String(entity.id) !== String(transactionForm.source_entity)).map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transaction type</label>
              <select value={transactionForm.transaction_type} onChange={(event) => setTransactionForm((current) => ({ ...current, transaction_type: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                <option value="invoice">Intercompany Invoice</option>
                <option value="loan">Intercompany Loan</option>
                <option value="transfer_pricing">Transfer Pricing Charge</option>
                <option value="adjustment">Intercompany Adjustment</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Currency</label>
              <input value={transactionForm.currency} onChange={(event) => setTransactionForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} maxLength={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transaction date</label>
              <input type="date" value={transactionForm.transaction_date} onChange={(event) => setTransactionForm((current) => ({ ...current, transaction_date: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Due / maturity date</label>
              <input type="date" value={transactionForm.due_date} onChange={(event) => setTransactionForm((current) => ({ ...current, due_date: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Amount</label>
              <input type="number" min="0" step="0.01" value={transactionForm.amount} onChange={(event) => setTransactionForm((current) => ({ ...current, amount: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transfer pricing markup %</label>
            <input type="number" min="0" step="0.0001" value={transactionForm.transfer_pricing_markup_percent} onChange={(event) => setTransactionForm((current) => ({ ...current, transfer_pricing_markup_percent: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
            <input value={transactionForm.description} onChange={(event) => setTransactionForm((current) => ({ ...current, description: event.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Notes</label>
            <textarea value={transactionForm.notes} onChange={(event) => setTransactionForm((current) => ({ ...current, notes: event.target.value }))} rows={4} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)', resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
            <input type="checkbox" checked={transactionForm.auto_post} onChange={(event) => setTransactionForm((current) => ({ ...current, auto_post: event.target.checked }))} />
            Auto-post mirrored documents and journals immediately after creation
          </label>
        </div>
      </Modal>
    </div>
  );
}
