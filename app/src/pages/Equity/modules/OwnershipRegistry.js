import React, { useMemo, useState } from 'react';
import EquityCrudModuleScreen from '../components/EquityCrudModuleScreen';
import { useEquity } from '../../../context/EquityContext';

const EMPTY_FORM = {
  name: '',
  shareholder_type: 'individual',
  email: '',
  beneficial_owner: false,
  voting_rights_percent: '0',
  kyc_status: 'pending',
  aml_status: 'pending',
  notes: '',
};

const OwnershipRegistry = () => {
  const {
    shareholders,
    holdings,
    summary,
    loading,
    error,
    saving,
    createShareholder,
    updateShareholder,
    deleteShareholder,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const metrics = useMemo(() => ([
    { label: 'Registered holders', value: summary.totalShareholders, note: 'Individuals, entities, employees, and investors' },
    { label: 'Beneficial owners', value: shareholders.filter((item) => item.beneficial_owner).length, note: 'Ultimate ownership disclosures tracked' },
    { label: 'Voting positions', value: holdings.length, note: 'Recorded positions with voting rights history' },
  ]), [holdings.length, shareholders, summary.totalShareholders]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      voting_rights_percent: Number(form.voting_rights_percent || 0),
    };

    if (editingId) {
      await updateShareholder(editingId, payload);
    } else {
      await createShareholder(payload);
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      name: record.name || '',
      shareholder_type: record.shareholder_type || 'individual',
      email: record.email || '',
      beneficial_owner: Boolean(record.beneficial_owner),
      voting_rights_percent: String(record.voting_rights_percent ?? '0'),
      kyc_status: record.kyc_status || 'pending',
      aml_status: record.aml_status || 'pending',
      notes: record.notes || '',
    });
  };

  const handleDelete = async (record) => {
    await deleteShareholder(record.id);
    if (editingId === record.id) {
      resetForm();
    }
  };

  return (
    <EquityCrudModuleScreen
      title="Ownership Registry"
      description="Maintain a compliance-grade register of shareholders, beneficial owners, voting rights, and KYC or AML posture."
      metrics={metrics}
      records={shareholders}
      columns={[
        { key: 'name', label: 'Shareholder' },
        { key: 'shareholder_type', label: 'Type' },
        { key: 'email', label: 'Contact' },
        { key: 'kyc_status', label: 'KYC' },
        { key: 'aml_status', label: 'AML' },
        { key: 'voting_rights_percent', label: 'Voting %' },
      ]}
      emptyTitle="No shareholders have been registered yet"
      emptyBody="Create the first holder record to start the beneficial ownership registry and compliance workflow."
      formTitle="Create shareholder"
      formDescription="Capture the legal owner, beneficial owner designation, and onboarding status used throughout ATC Equity Management."
      formFields={[
        { key: 'name', label: 'Shareholder name', placeholder: 'Ada Ventures SPV' },
        {
          key: 'shareholder_type',
          label: 'Holder type',
          type: 'select',
          options: [
            { value: 'individual', label: 'Individual' },
            { value: 'entity', label: 'Entity' },
            { value: 'employee', label: 'Employee' },
            { value: 'investor', label: 'Investor' },
          ],
        },
        { key: 'email', label: 'Contact email', type: 'email', placeholder: 'owner@example.com' },
        { key: 'voting_rights_percent', label: 'Voting rights %', type: 'number', min: '0', step: '0.01' },
        { key: 'kyc_status', label: 'KYC status', placeholder: 'pending' },
        { key: 'aml_status', label: 'AML status', placeholder: 'pending' },
        { key: 'beneficial_owner', label: 'Beneficial owner', type: 'checkbox', fullWidth: true, checkboxLabel: 'Mark as beneficial owner' },
        { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Compliance and transfer notes' },
      ]}
      formState={form}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onEdit={handleEdit}
      onDelete={handleDelete}
      editingLabel={editingId ? 'Edit shareholder' : ''}
      saving={saving}
      loading={loading}
      error={error}
    />
  );
};

export default OwnershipRegistry;
