import React, { useMemo, useState } from 'react';
import EquityCrudModuleScreen from '../components/EquityCrudModuleScreen';
import { useEquity } from '../../../context/EquityContext';

const EMPTY_FORM = {
  name: '',
  class_type: 'common',
  authorized_shares: '0',
  issued_shares: '0',
  liquidation_preference: '',
  voting_rights: true,
  par_value: '0',
  currency: 'USD',
};

const CapTable = () => {
  const {
    shareClasses,
    fundingRounds,
    summary,
    loading,
    error,
    saving,
    createShareClass,
    updateShareClass,
    deleteShareClass,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const metrics = useMemo(() => ([
    { label: 'Share classes', value: summary.totalShareClasses, note: 'Common, preferred, options, warrants, and convertibles' },
    { label: 'Issued positions', value: summary.totalHoldings, note: 'Units currently represented on the cap table' },
    { label: 'Funding rounds', value: fundingRounds.length, note: 'Round history for dilution and scenario modeling' },
  ]), [fundingRounds.length, summary.totalHoldings, summary.totalShareClasses]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      authorized_shares: Number(form.authorized_shares || 0),
      issued_shares: Number(form.issued_shares || 0),
      par_value: Number(form.par_value || 0),
    };

    if (editingId) {
      await updateShareClass(editingId, payload);
    } else {
      await createShareClass(payload);
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      name: record.name || '',
      class_type: record.class_type || 'common',
      authorized_shares: String(record.authorized_shares ?? 0),
      issued_shares: String(record.issued_shares ?? 0),
      liquidation_preference: record.liquidation_preference || '',
      voting_rights: Boolean(record.voting_rights),
      par_value: String(record.par_value ?? 0),
      currency: record.currency || 'USD',
    });
  };

  const handleDelete = async (record) => {
    await deleteShareClass(record.id);
    if (editingId === record.id) {
      resetForm();
    }
  };

  return (
    <EquityCrudModuleScreen
      title="Cap Table Engine"
      description="Track issued shares, dilution, vesting exposure, and financing instruments in one real-time ownership model."
      metrics={metrics}
      records={shareClasses}
      columns={[
        { key: 'name', label: 'Share class' },
        { key: 'class_type', label: 'Type' },
        { key: 'authorized_shares', label: 'Authorized' },
        { key: 'issued_shares', label: 'Issued' },
        { key: 'currency', label: 'Currency' },
        { key: 'par_value', label: 'Par value' },
      ]}
      emptyTitle="The cap table has not been initialized"
      emptyBody="Add the first share class to unlock structured ownership, dilution, and issuance management."
      formTitle="Create share class"
      formDescription="Manage the instruments your workspace can issue across common equity, preferred rounds, and employee equity programs."
      formFields={[
        { key: 'name', label: 'Class name', placeholder: 'Series A Preferred' },
        {
          key: 'class_type',
          label: 'Class type',
          type: 'select',
          options: [
            { value: 'common', label: 'Common' },
            { value: 'preferred', label: 'Preferred' },
            { value: 'esop', label: 'ESOP' },
            { value: 'warrant', label: 'Warrant' },
            { value: 'safe', label: 'SAFE' },
            { value: 'convertible', label: 'Convertible' },
          ],
        },
        { key: 'authorized_shares', label: 'Authorized shares', type: 'number', min: '0', step: '1' },
        { key: 'issued_shares', label: 'Issued shares', type: 'number', min: '0', step: '1' },
        { key: 'currency', label: 'Currency', placeholder: 'USD' },
        { key: 'par_value', label: 'Par value', type: 'number', min: '0', step: '0.0001' },
        { key: 'voting_rights', label: 'Voting rights', type: 'checkbox', fullWidth: true, checkboxLabel: 'Grant voting rights' },
        { key: 'liquidation_preference', label: 'Liquidation preference', fullWidth: true, placeholder: '1x non-participating' },
      ]}
      formState={form}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onEdit={handleEdit}
      onDelete={handleDelete}
      editingLabel={editingId ? 'Edit share class' : ''}
      saving={saving}
      loading={loading}
      error={error}
    />
  );
};

export default CapTable;
