import React, { useMemo, useState } from 'react';
import EquityCrudModuleScreen from '../components/EquityCrudModuleScreen';
import { useEquity } from '../../../context/EquityContext';

const EMPTY_FORM = {
  transaction_type: 'issue',
  shareholder: '',
  share_class: '',
  quantity: '0',
  price_per_share: '0',
  effective_date: '',
  approval_status: 'draft',
  compliance_checked: false,
  digital_signature_required: true,
};

const EquityTransactions = () => {
  const {
    transactions,
    shareholders,
    shareClasses,
    summary,
    loading,
    error,
    saving,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const metrics = useMemo(() => ([
    { label: 'Transactions', value: transactions.length, note: 'Issuances, transfers, exercises, and conversions' },
    { label: 'Pending approvals', value: summary.pendingTransactions, note: 'Workflows awaiting governance action' },
    { label: 'Compliance checked', value: transactions.filter((item) => item.compliance_checked).length, note: 'Transactions with compliance validation complete' },
  ]), [summary.pendingTransactions, transactions]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      shareholder: form.shareholder || null,
      share_class: form.share_class || null,
      quantity: Number(form.quantity || 0),
      price_per_share: Number(form.price_per_share || 0),
    };

    if (editingId) {
      await updateTransaction(editingId, payload);
    } else {
      await createTransaction(payload);
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      transaction_type: record.transaction_type || 'issue',
      shareholder: record.shareholder || '',
      share_class: record.share_class || '',
      quantity: String(record.quantity ?? 0),
      price_per_share: String(record.price_per_share ?? 0),
      effective_date: record.effective_date || '',
      approval_status: record.approval_status || 'draft',
      compliance_checked: Boolean(record.compliance_checked),
      digital_signature_required: Boolean(record.digital_signature_required),
    });
  };

  const handleDelete = async (record) => {
    await deleteTransaction(record.id);
    if (editingId === record.id) {
      resetForm();
    }
  };

  return (
    <EquityCrudModuleScreen
      title="Equity Transactions"
      description="Issue shares, transfer ownership, run approvals, and keep digital-signature and compliance evidence attached to every transaction."
      metrics={metrics}
      records={transactions}
      columns={[
        { key: 'transaction_type', label: 'Type' },
        { key: 'shareholder_name', label: 'Shareholder' },
        { key: 'share_class_name', label: 'Share class' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'approval_status', label: 'Approval' },
        { key: 'effective_date', label: 'Effective date' },
      ]}
      emptyTitle="No equity transactions have been recorded"
      emptyBody="Once transactions are created, approvals, audit evidence, and execution status will appear here."
      formTitle="Create transaction"
      formDescription="Record issuances, transfers, exercises, and conversions with the compliance and signature requirements that support them."
      formFields={[
        {
          key: 'transaction_type',
          label: 'Transaction type',
          type: 'select',
          options: [
            { value: 'issue', label: 'Issue' },
            { value: 'transfer', label: 'Transfer' },
            { value: 'exercise', label: 'Exercise' },
            { value: 'cancellation', label: 'Cancellation' },
            { value: 'conversion', label: 'Conversion' },
          ],
        },
        {
          key: 'approval_status',
          label: 'Approval status',
          type: 'select',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'executed', label: 'Executed' },
          ],
        },
        {
          key: 'shareholder',
          label: 'Shareholder',
          type: 'select',
          options: shareholders.map((item) => ({ value: item.id, label: item.name })),
        },
        {
          key: 'share_class',
          label: 'Share class',
          type: 'select',
          options: shareClasses.map((item) => ({ value: item.id, label: item.name })),
        },
        { key: 'quantity', label: 'Quantity', type: 'number', min: '0', step: '1' },
        { key: 'price_per_share', label: 'Price per share', type: 'number', min: '0', step: '0.0001' },
        { key: 'effective_date', label: 'Effective date', type: 'date' },
        { key: 'compliance_checked', label: 'Compliance checked', type: 'checkbox', checkboxLabel: 'Compliance validation completed' },
        { key: 'digital_signature_required', label: 'Digital signature required', type: 'checkbox', checkboxLabel: 'Require digital signatures' },
      ]}
      formState={form}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onEdit={handleEdit}
      onDelete={handleDelete}
      editingLabel={editingId ? 'Edit transaction' : ''}
      saving={saving}
      loading={loading}
      error={error}
    />
  );
};

export default EquityTransactions;
