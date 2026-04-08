import React, { useMemo, useState } from 'react';
import EquityCrudModuleScreen from '../components/EquityCrudModuleScreen';
import { useEquity } from '../../../context/EquityContext';

const EMPTY_FORM = {
  title: '',
  report_type: 'board_report',
  reporting_period: '',
  status: 'ready',
};

const GovernanceReporting = () => {
  const {
    reports,
    transactions,
    summary,
    loading,
    error,
    saving,
    createReport,
    updateReport,
    deleteReport,
    downloadReportPdf,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const metrics = useMemo(() => ([
    { label: 'Reports ready', value: summary.readyReports, note: 'Board packs, investor reports, certificates, and filings' },
    { label: 'Executed actions', value: transactions.filter((item) => item.approval_status === 'executed').length, note: 'Fully executed transactions with traceability' },
    { label: 'Audit logs attached', value: transactions.filter((item) => item.audit_metadata && Object.keys(item.audit_metadata).length > 0).length, note: 'Transactions with supporting audit metadata' },
  ]), [summary.readyReports, transactions]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await updateReport(editingId, form);
    } else {
      await createReport(form);
    }
    resetForm();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      title: record.title || '',
      report_type: record.report_type || 'board_report',
      reporting_period: record.reporting_period || '',
      status: record.status || 'ready',
    });
  };

  const handleDelete = async (record) => {
    await deleteReport(record.id);
    if (editingId === record.id) {
      resetForm();
    }
  };

  return (
    <EquityCrudModuleScreen
      title="Governance & Reporting"
      description="Generate investor-ready, board-ready, and regulator-ready reporting with ownership evidence, approvals, and audit trails attached."
      metrics={metrics}
      records={reports}
      columns={[
        { key: 'title', label: 'Report' },
        { key: 'report_type', label: 'Type' },
        { key: 'reporting_period', label: 'Period' },
        { key: 'status', label: 'Status' },
        {
          key: 'export',
          label: 'Export',
          render: (record) => (
            record.report_type === 'scenario_model' || record.payload?.analysis
              ? <button type="button" className="eq-inline-btn" onClick={() => downloadReportPdf(record.id, `${(record.title || 'scenario-report').toLowerCase().replace(/\s+/g, '-')}.pdf`)}>PDF</button>
              : '—'
          ),
        },
        { key: 'created_at', label: 'Generated' },
      ]}
      emptyTitle="No governance reports have been generated"
      emptyBody="This workspace is ready for investor reports, board packs, beneficial ownership extracts, and regulatory filing output."
      formTitle="Create report"
      formDescription="Publish the artifacts your board, investors, and regulators need without leaving the equity operating surface."
      formFields={[
        { key: 'title', label: 'Report title', placeholder: 'Q2 Board Pack' },
        {
          key: 'report_type',
          label: 'Report type',
          type: 'select',
          options: [
            { value: 'board_report', label: 'Board report' },
            { value: 'investor_report', label: 'Investor report' },
            { value: 'scenario_model', label: 'Scenario model' },
            { value: 'certificate', label: 'Certificate' },
            { value: 'beneficial_ownership', label: 'Beneficial ownership' },
            { value: 'regulatory_filing', label: 'Regulatory filing' },
          ],
        },
        { key: 'reporting_period', label: 'Reporting period', placeholder: 'Q2 2026' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'ready', label: 'Ready' },
            { value: 'draft', label: 'Draft' },
            { value: 'queued', label: 'Queued' },
          ],
        },
      ]}
      formState={form}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onEdit={handleEdit}
      onDelete={handleDelete}
      editingLabel={editingId ? 'Edit report' : ''}
      saving={saving}
      loading={loading}
      error={error}
    />
  );
};

export default GovernanceReporting;
