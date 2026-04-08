import React, { useMemo, useState } from 'react';
import EquityCrudModuleScreen from '../components/EquityCrudModuleScreen';
import { useEquity } from '../../../context/EquityContext';

const EMPTY_FORM = {
  title: '',
  method: 'board',
  valuation_date: '',
  enterprise_value: '0',
  equity_value: '0',
  price_per_share: '0',
  market_notes: '',
};

const Valuation = () => {
  const {
    valuations,
    fundingRounds,
    summary,
    loading,
    error,
    saving,
    createValuation,
    updateValuation,
    deleteValuation,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const metrics = useMemo(() => ([
    { label: 'Latest equity value', value: summary.latestEquityValue, note: 'Most recent equity value recorded for this workspace' },
    { label: 'Valuation runs', value: valuations.length, note: 'DCF, comparables, market, or board-approved valuations' },
    { label: 'Capital events', value: fundingRounds.length, note: 'Funding events informing price and benchmark analysis' },
  ]), [fundingRounds.length, summary.latestEquityValue, valuations.length]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      enterprise_value: Number(form.enterprise_value || 0),
      equity_value: Number(form.equity_value || 0),
      price_per_share: Number(form.price_per_share || 0),
    };

    if (editingId) {
      await updateValuation(editingId, payload);
    } else {
      await createValuation(payload);
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      title: record.title || '',
      method: record.method || 'board',
      valuation_date: record.valuation_date || '',
      enterprise_value: String(record.enterprise_value ?? 0),
      equity_value: String(record.equity_value ?? 0),
      price_per_share: String(record.price_per_share ?? 0),
      market_notes: record.market_notes || '',
    });
  };

  const handleDelete = async (record) => {
    await deleteValuation(record.id);
    if (editingId === record.id) {
      resetForm();
    }
  };

  return (
    <EquityCrudModuleScreen
      title="Valuation & Market Intelligence"
      description="Bring private market valuation, market comparables, and pricing context into the same operating surface as your ownership records."
      metrics={metrics}
      records={valuations}
      columns={[
        { key: 'title', label: 'Valuation' },
        { key: 'method', label: 'Method' },
        { key: 'valuation_date', label: 'Date' },
        { key: 'enterprise_value', label: 'Enterprise Value' },
        { key: 'equity_value', label: 'Equity Value' },
        { key: 'price_per_share', label: 'Price / Share' },
      ]}
      emptyTitle="No valuation records yet"
      emptyBody="Record the first valuation to benchmark funding rounds and make dilution decisions from a current pricing baseline."
      formTitle="Create valuation"
      formDescription="Store the approved valuation inputs your board, investors, and operators will rely on for equity decisions."
      formFields={[
        { key: 'title', label: 'Valuation title', placeholder: '409A Board Approval' },
        {
          key: 'method',
          label: 'Method',
          type: 'select',
          options: [
            { value: 'board', label: 'Board approved' },
            { value: 'dcf', label: 'DCF' },
            { value: 'comps', label: 'Comparables' },
            { value: 'market', label: 'Market' },
          ],
        },
        { key: 'valuation_date', label: 'Valuation date', type: 'date' },
        { key: 'price_per_share', label: 'Price per share', type: 'number', min: '0', step: '0.0001' },
        { key: 'enterprise_value', label: 'Enterprise value', type: 'number', min: '0', step: '0.01' },
        { key: 'equity_value', label: 'Equity value', type: 'number', min: '0', step: '0.01' },
        { key: 'market_notes', label: 'Market notes', type: 'textarea', fullWidth: true, placeholder: 'Comparable set, sector multiples, and board commentary' },
      ]}
      formState={form}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onEdit={handleEdit}
      onDelete={handleDelete}
      editingLabel={editingId ? 'Edit valuation' : ''}
      saving={saving}
      loading={loading}
      error={error}
    />
  );
};

export default Valuation;
