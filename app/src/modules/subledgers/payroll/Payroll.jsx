import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Modal, PageHeader } from '../../../components/ui';
import {
  accountingApprovalDelegationsAPI,
  accountingApprovalMatricesAPI,
  entitiesAPI,
  entityRolesAPI,
  entityStaffAPI,
  leaveBalancesAPI,
  leaveRequestsAPI,
  leaveTypesAPI,
  organizationsAPI,
  payrollBankOriginatorsAPI,
  payrollBankFilesAPI,
  payrollComponentsAPI,
  payrollRunsAPI,
  payrollStatutoryReportsAPI,
  staffPayrollComponentAssignmentsAPI,
  staffPayrollProfilesAPI,
} from '../../../services/api';

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

const formatMoney = (value, currency = 'USD') => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency,
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const humanize = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_RUN_FORM = {
  organization: '',
  entity: '',
  name: '',
  pay_frequency: 'monthly',
  requested_bank_file_format: 'csv',
  requested_bank_institution: 'generic',
  requested_bank_export_variant: 'standard',
  period_start: '',
  period_end: '',
  payment_date: '',
  notes: '',
};

const EMPTY_PROFILE_FORM = {
  staff_member: '',
  entity: '',
  pay_frequency: 'monthly',
  salary_basis: 'annual',
  base_salary: '',
  income_tax_rate: '0.1000',
  employee_tax_rate: '0.0000',
  employer_tax_rate: '0.0000',
  default_bank_account_name: '',
  default_bank_account_number: '',
  default_bank_routing_number: '',
  default_bank_iban: '',
  default_bank_swift_code: '',
  default_bank_sort_code: '',
  payment_reference: '',
  tax_identifier: '',
  statutory_jurisdiction: '',
};

const BLANK_MATRIX = {
  entity: '',
  name: '',
  object_type: 'payroll_run',
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
  object_type: 'payroll_run',
  delegator: '',
  delegate: '',
  stage: 'reviewer',
  minimum_amount: '0',
  maximum_amount: '',
  start_date: today(),
  end_date: today(),
  is_active: true,
  notes: '',
};

const EMPTY_COMPONENT_FORM = {
  entity: '',
  code: '',
  name: '',
  component_type: 'earning',
  calculation_type: 'fixed',
  amount: '',
  taxable: true,
  employer_contribution: false,
};

const EMPTY_ASSIGNMENT_FORM = {
  staff_member: '',
  component: '',
  amount_override: '',
  effective_start: '',
  effective_end: '',
};

const EMPTY_LEAVE_TYPE_FORM = {
  entity: '',
  code: '',
  name: '',
  accrual_hours_per_run: '0',
  max_balance_hours: '0',
  carryover_limit_hours: '0',
  is_paid_leave: true,
};

const EMPTY_LEAVE_REQUEST_FORM = {
  staff_member: '',
  leave_type: '',
  start_date: today(),
  end_date: today(),
  hours_requested: '8',
  notes: '',
};

const EMPTY_ORIGINATOR_FORM = {
  entity: '',
  originator_name: '',
  originator_identifier: '',
  originating_bank_name: '',
  debit_account_name: '',
  debit_account_number: '',
  debit_routing_number: '',
  debit_iban: '',
  debit_swift_code: '',
  debit_sort_code: '',
  company_entry_description: 'PAYROLL',
  company_discretionary_data: '',
  initiating_party_name: '',
  initiating_party_identifier: '',
  is_active: true,
};

function SectionTable({ columns, rows, emptyMessage, actions }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ textAlign: 'left', fontSize: 12, color: '#6b7280', padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>{column.label}</th>
            ))}
            {actions ? <th style={{ textAlign: 'left', fontSize: 12, color: '#6b7280', padding: '10px 8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: 16, color: '#6b7280' }}>{emptyMessage}</td>
            </tr>
          ) : rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} style={{ padding: '10px 8px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>
                  {column.render ? column.render(row[column.key], row) : row[column.key] || '—'}
                </td>
              ))}
              {actions ? <td style={{ padding: '10px 8px', borderBottom: '1px solid #f3f4f6' }}>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return <input {...props} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', ...(props.style || {}) }} />;
}

function SelectInput(props) {
  return <select {...props} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', ...(props.style || {}) }} />;
}

export default function Payroll() {
  const [organizations, setOrganizations] = useState([]);
  const [entities, setEntities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [components, setComponents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [statutoryReports, setStatutoryReports] = useState([]);
  const [bankFiles, setBankFiles] = useState([]);
  const [originatorProfiles, setOriginatorProfiles] = useState([]);
  const [approvalMatrices, setApprovalMatrices] = useState([]);
  const [approvalDelegations, setApprovalDelegations] = useState([]);
  const [bankExportOptions, setBankExportOptions] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [selectedRunId, setSelectedRunId] = useState('');
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyRunId, setBusyRunId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [runForm, setRunForm] = useState(EMPTY_RUN_FORM);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [componentForm, setComponentForm] = useState(EMPTY_COMPONENT_FORM);
  const [assignmentForm, setAssignmentForm] = useState(EMPTY_ASSIGNMENT_FORM);
  const [leaveTypeForm, setLeaveTypeForm] = useState(EMPTY_LEAVE_TYPE_FORM);
  const [leaveRequestForm, setLeaveRequestForm] = useState(EMPTY_LEAVE_REQUEST_FORM);
  const [matrixForm, setMatrixForm] = useState(BLANK_MATRIX);
  const [delegationForm, setDelegationForm] = useState(BLANK_DELEGATION);
  const [originatorForm, setOriginatorForm] = useState(EMPTY_ORIGINATOR_FORM);
  const [editingMatrixId, setEditingMatrixId] = useState('');
  const [editingDelegationId, setEditingDelegationId] = useState('');
  const [editingOriginatorId, setEditingOriginatorId] = useState('');

  const load = useCallback(async (entityId = selectedEntityId) => {
    setLoading(true);
    try {
      const [organizationsRes, entitiesRes, rolesRes, staffRes, profilesRes, componentsRes, assignmentsRes, leaveTypesRes, leaveBalancesRes, leaveRequestsRes, payrollRunsRes, originatorsRes, matricesRes, delegationsRes, exportOptionsRes] = await Promise.all([
        organizationsAPI.getAll(),
        entitiesAPI.getAll(),
        entityRolesAPI.getAll(entityId ? { entity: entityId } : {}),
        entityStaffAPI.getAll(entityId ? { entity: entityId } : {}),
        staffPayrollProfilesAPI.getAll(entityId ? { entity: entityId } : {}),
        payrollComponentsAPI.getAll(entityId ? { entity: entityId } : {}),
        staffPayrollComponentAssignmentsAPI.getAll(),
        leaveTypesAPI.getAll(entityId ? { entity: entityId } : {}),
        leaveBalancesAPI.getAll(entityId ? { entity: entityId } : {}),
        leaveRequestsAPI.getAll(entityId ? { entity: entityId } : {}),
        payrollRunsAPI.getAll(entityId ? { entity: entityId } : {}),
        payrollBankOriginatorsAPI.getAll(entityId ? { entity: entityId } : {}),
        accountingApprovalMatricesAPI.getAll(entityId ? { entity: entityId, object_type: 'payroll_run' } : { object_type: 'payroll_run' }),
        accountingApprovalDelegationsAPI.getAll(entityId ? { entity: entityId, object_type: 'payroll_run' } : { object_type: 'payroll_run' }),
        payrollRunsAPI.exportOptions(entityId ? { entity: entityId } : {}),
      ]);

      const loadedEntities = parseList(entitiesRes);
      const resolvedEntityId = entityId || String(loadedEntities[0]?.id || '');
      const loadedRuns = parseList(payrollRunsRes);
      const resolvedRunId = selectedRunId && loadedRuns.some((item) => String(item.id) === String(selectedRunId))
        ? selectedRunId
        : String(loadedRuns[0]?.id || '');

      setOrganizations(parseList(organizationsRes));
      setEntities(loadedEntities);
      setRoles(parseList(rolesRes));
      setStaff(parseList(staffRes));
      setProfiles(parseList(profilesRes));
      setComponents(parseList(componentsRes));
      setAssignments(parseList(assignmentsRes));
      setLeaveTypes(parseList(leaveTypesRes));
      setLeaveBalances(parseList(leaveBalancesRes));
      setLeaveRequests(parseList(leaveRequestsRes));
      setPayrollRuns(loadedRuns);
      setOriginatorProfiles(parseList(originatorsRes));
      setApprovalMatrices(parseList(matricesRes));
      setApprovalDelegations(parseList(delegationsRes));
      setBankExportOptions(parseList(exportOptionsRes));
      setSelectedEntityId(resolvedEntityId);
      setSelectedRunId(resolvedRunId);

      if (resolvedRunId) {
        const [reportsRes, bankFilesRes] = await Promise.all([
          payrollStatutoryReportsAPI.getAll({ payroll_run: resolvedRunId }),
          payrollBankFilesAPI.getAll({ payroll_run: resolvedRunId }),
        ]);
        setStatutoryReports(parseList(reportsRes));
        setBankFiles(parseList(bankFilesRes));
      } else {
        setStatutoryReports([]);
        setBankFiles([]);
      }

      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load the payroll console.'));
    }
    setLoading(false);
  }, [selectedEntityId, selectedRunId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedEntityId) {
      load(selectedEntityId);
    }
  }, [load, selectedEntityId]);

  const selectedEntity = useMemo(
    () => entities.find((entity) => String(entity.id) === String(selectedEntityId)) || null,
    [entities, selectedEntityId],
  );

  const selectedRun = useMemo(
    () => payrollRuns.find((run) => String(run.id) === String(selectedRunId)) || payrollRuns[0] || null,
    [payrollRuns, selectedRunId],
  );

  const selectedRunBankFile = bankFiles[0] || selectedRun?.bank_payment_file || null;
  const selectedExportFormat = useMemo(
    () => bankExportOptions.find((item) => item.file_format === runForm.requested_bank_file_format) || null,
    [bankExportOptions, runForm.requested_bank_file_format],
  );
  const selectedInstitution = useMemo(
    () => selectedExportFormat?.institutions?.find((item) => item.institution_code === runForm.requested_bank_institution) || selectedExportFormat?.institutions?.[0] || null,
    [runForm.requested_bank_institution, selectedExportFormat],
  );
  const availableVariants = selectedInstitution?.variants || [];
  const staffIdSet = new Set(staff.map((item) => item.id));
  const visibleAssignments = assignments.filter((assignment) => staffIdSet.has(assignment.staff_member));
  const latestRun = payrollRuns[0] || null;
  const visibleOriginatorProfile = originatorProfiles.find((item) => String(item.entity) === String(selectedEntityId || '')) || null;
  const visibleApprovalMatrices = approvalMatrices.filter((item) => String(item.entity) === String(selectedEntityId || ''));
  const visibleApprovalDelegations = approvalDelegations.filter((item) => String(item.entity) === String(selectedEntityId || ''));

  const stats = [
    { label: 'Payroll Profiles', value: profiles.length, note: 'Configured compensation and tax profiles' },
    { label: 'Components', value: components.length, note: 'Earnings, benefits, and deductions rules' },
    { label: 'Open Leave Requests', value: leaveRequests.filter((item) => ['draft', 'submitted', 'approved'].includes(item.status)).length, note: 'Pending or approved leave awaiting payroll processing' },
    { label: 'Latest Net Pay', value: latestRun ? formatMoney(latestRun.net_pay_total, selectedEntity?.local_currency || 'USD') : '—', note: latestRun ? latestRun.name : 'No payroll run processed yet' },
  ];

  const openModal = (type, record = null) => {
    if (type === 'run') {
      setRunForm({
        ...EMPTY_RUN_FORM,
        organization: selectedEntity?.organization || organizations[0]?.id || '',
        entity: selectedEntityId,
        name: selectedEntity ? `${selectedEntity.name} Payroll ${new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })}` : 'Payroll Run',
        pay_frequency: 'monthly',
        requested_bank_file_format: 'csv',
        requested_bank_institution: 'generic',
        requested_bank_export_variant: 'standard',
        period_start: today(),
        period_end: today(),
        payment_date: today(),
      });
    }
    if (type === 'profile') {
      setProfileForm({ ...EMPTY_PROFILE_FORM, entity: selectedEntityId, statutory_jurisdiction: selectedEntity?.country || '' });
    }
    if (type === 'approval-matrix') {
      setEditingMatrixId(record?.id ? String(record.id) : '');
      setMatrixForm(record ? {
        entity: String(record.entity || selectedEntityId || ''),
        name: record.name || '',
        object_type: 'payroll_run',
        description: record.description || '',
        minimum_amount: record.minimum_amount || '0',
        maximum_amount: record.maximum_amount || '',
        preparer_role: String(record.preparer_role || ''),
        reviewer_role: String(record.reviewer_role || ''),
        approver_role: String(record.approver_role || ''),
        require_reviewer: Boolean(record.require_reviewer),
        require_approver: Boolean(record.require_approver),
        allow_self_review: Boolean(record.allow_self_review),
        allow_self_approval: Boolean(record.allow_self_approval),
        is_active: Boolean(record.is_active),
      } : { ...BLANK_MATRIX, entity: selectedEntityId || '' });
    }
    if (type === 'approval-delegation') {
      setEditingDelegationId(record?.id ? String(record.id) : '');
      setDelegationForm(record ? {
        entity: String(record.entity || selectedEntityId || ''),
        object_type: 'payroll_run',
        delegator: String(record.delegator || ''),
        delegate: String(record.delegate || ''),
        stage: record.stage || 'reviewer',
        minimum_amount: record.minimum_amount || '0',
        maximum_amount: record.maximum_amount || '',
        start_date: record.start_date || today(),
        end_date: record.end_date || today(),
        is_active: Boolean(record.is_active),
        notes: record.notes || '',
      } : { ...BLANK_DELEGATION, entity: selectedEntityId || '', delegator: staff[0]?.id || '', delegate: staff[1]?.id || staff[0]?.id || '' });
    }
    if (type === 'originator') {
      setEditingOriginatorId(record?.id ? String(record.id) : '');
      setOriginatorForm(record ? {
        entity: String(record.entity || selectedEntityId || ''),
        originator_name: record.originator_name || '',
        originator_identifier: record.originator_identifier || '',
        originating_bank_name: record.originating_bank_name || '',
        debit_account_name: record.debit_account_name || '',
        debit_account_number: record.debit_account_number || '',
        debit_routing_number: record.debit_routing_number || '',
        debit_iban: record.debit_iban || '',
        debit_swift_code: record.debit_swift_code || '',
        debit_sort_code: record.debit_sort_code || '',
        company_entry_description: record.company_entry_description || 'PAYROLL',
        company_discretionary_data: record.company_discretionary_data || '',
        initiating_party_name: record.initiating_party_name || '',
        initiating_party_identifier: record.initiating_party_identifier || '',
        is_active: Boolean(record.is_active),
      } : {
        ...EMPTY_ORIGINATOR_FORM,
        entity: selectedEntityId || '',
        originator_name: selectedEntity?.name || '',
        initiating_party_name: selectedEntity?.name || '',
        originating_bank_name: selectedEntity?.main_bank || '',
      });
    }
    if (type === 'component') {
      setComponentForm({ ...EMPTY_COMPONENT_FORM, entity: selectedEntityId });
    }
    if (type === 'assignment') {
      setAssignmentForm({ ...EMPTY_ASSIGNMENT_FORM, staff_member: staff[0]?.id || '', component: components[0]?.id || '' });
    }
    if (type === 'leave-type') {
      setLeaveTypeForm({ ...EMPTY_LEAVE_TYPE_FORM, entity: selectedEntityId });
    }
    if (type === 'leave-request') {
      setLeaveRequestForm({ ...EMPTY_LEAVE_REQUEST_FORM, staff_member: staff[0]?.id || '', leave_type: leaveTypes[0]?.id || '' });
    }
    setModalType(type);
  };

  const closeModal = () => {
    setEditingMatrixId('');
    setEditingDelegationId('');
    setEditingOriginatorId('');
    setModalType('');
  };

  const submitModal = async () => {
    setSaving(true);
    setError('');
    try {
      if (modalType === 'run') {
        await payrollRunsAPI.create(runForm);
        setMessage('Payroll run created. Submit it for approval if a payroll matrix is configured, or process it directly if not.');
      }
      if (modalType === 'profile') {
        await staffPayrollProfilesAPI.create(profileForm);
        setMessage('Payroll profile saved.');
      }
      if (modalType === 'approval-matrix') {
        const payload = {
          ...matrixForm,
          entity: Number(matrixForm.entity),
          object_type: 'payroll_run',
          maximum_amount: matrixForm.maximum_amount || null,
          preparer_role: matrixForm.preparer_role || null,
          reviewer_role: matrixForm.reviewer_role || null,
          approver_role: matrixForm.approver_role || null,
        };
        if (editingMatrixId) await accountingApprovalMatricesAPI.update(editingMatrixId, payload);
        else await accountingApprovalMatricesAPI.create(payload);
        setMessage('Payroll approval matrix saved.');
      }
      if (modalType === 'approval-delegation') {
        const payload = {
          ...delegationForm,
          entity: Number(delegationForm.entity),
          object_type: 'payroll_run',
          delegator: Number(delegationForm.delegator),
          delegate: Number(delegationForm.delegate),
          maximum_amount: delegationForm.maximum_amount || null,
        };
        if (editingDelegationId) await accountingApprovalDelegationsAPI.update(editingDelegationId, payload);
        else await accountingApprovalDelegationsAPI.create(payload);
        setMessage('Payroll approval delegation saved.');
      }
      if (modalType === 'originator') {
        const payload = {
          ...originatorForm,
          entity: Number(originatorForm.entity),
        };
        if (editingOriginatorId) await payrollBankOriginatorsAPI.update(editingOriginatorId, payload);
        else await payrollBankOriginatorsAPI.create(payload);
        setMessage('Payroll bank originator profile saved.');
      }
      if (modalType === 'component') {
        await payrollComponentsAPI.create(componentForm);
        setMessage('Payroll component saved.');
      }
      if (modalType === 'assignment') {
        await staffPayrollComponentAssignmentsAPI.create({
          ...assignmentForm,
          amount_override: assignmentForm.amount_override || null,
          effective_start: assignmentForm.effective_start || null,
          effective_end: assignmentForm.effective_end || null,
        });
        setMessage('Component assigned to staff member.');
      }
      if (modalType === 'leave-type') {
        await leaveTypesAPI.create(leaveTypeForm);
        setMessage('Leave policy saved.');
      }
      if (modalType === 'leave-request') {
        await leaveRequestsAPI.create(leaveRequestForm);
        setMessage('Leave request submitted.');
      }
      closeModal();
      await load(selectedEntityId);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save payroll data.'));
    }
    setSaving(false);
  };

  const handleRunAction = async (runId, action) => {
    setBusyRunId(String(runId));
    setError('');
    try {
      if (action === 'process') {
        await payrollRunsAPI.process(runId);
        setMessage('Payroll run processed. Payslips, reports, journals, and payment file generated.');
      }
      if (action === 'submit') {
        await payrollRunsAPI.submit(runId);
        setMessage('Payroll run submitted into the approval workflow.');
      }
      if (action === 'approve') {
        const comments = window.prompt('Approval note (optional):', '') || '';
        await payrollRunsAPI.approve(runId, { comments });
        setMessage('Payroll run approval step completed.');
      }
      if (action === 'reject') {
        const comments = window.prompt('Rejection reason:', '');
        if (comments === null) {
          setBusyRunId('');
          return;
        }
        await payrollRunsAPI.reject(runId, { comments });
        setMessage('Payroll run rejected.');
      }
      if (action === 'markPaid') {
        await payrollRunsAPI.markPaid(runId);
        setMessage('Payroll run marked as paid.');
      }
      await load(selectedEntityId);
      setSelectedRunId(String(runId));
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to update payroll run.'));
    }
    setBusyRunId('');
  };

  const handleLeaveAction = async (leaveRequestId, action) => {
    try {
      if (action === 'approve') await leaveRequestsAPI.approve(leaveRequestId);
      if (action === 'reject') await leaveRequestsAPI.reject(leaveRequestId);
      setMessage(`Leave request ${action}d.`);
      await load(selectedEntityId);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to update the leave request.'));
    }
  };

  const handleDeleteApprovalMatrix = async (matrixId) => {
    if (!window.confirm('Delete this payroll approval matrix?')) return;
    try {
      await accountingApprovalMatricesAPI.delete(matrixId);
      setMessage('Payroll approval matrix deleted.');
      await load(selectedEntityId);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete the payroll approval matrix.'));
    }
  };

  const handleDeleteApprovalDelegation = async (delegationId) => {
    if (!window.confirm('Delete this payroll approval delegation?')) return;
    try {
      await accountingApprovalDelegationsAPI.delete(delegationId);
      setMessage('Payroll approval delegation deleted.');
      await load(selectedEntityId);
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete the payroll approval delegation.'));
    }
  };

  return (
    <div className="module-page">
      <PageHeader
        title="Payroll Console"
        subtitle="Run payroll, generate payslips, accrue leave, produce statutory reports, and export bank payment files from one subledger surface."
        actions={(
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="small" onClick={() => openModal('originator', visibleOriginatorProfile)}>Bank Originator</Button>
            <Button variant="secondary" size="small" onClick={() => openModal('approval-matrix')}>Approval Matrix</Button>
            <Button variant="secondary" size="small" onClick={() => openModal('approval-delegation')}>Delegation</Button>
            <Button variant="secondary" size="small" onClick={() => openModal('profile')}>New Profile</Button>
            <Button variant="secondary" size="small" onClick={() => openModal('component')}>New Component</Button>
            <Button variant="secondary" size="small" onClick={() => openModal('leave-type')}>New Leave Policy</Button>
            <Button variant="primary" size="small" onClick={() => openModal('run')}>New Pay Run</Button>
          </div>
        )}
      />

      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div> : null}
      {message ? <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{message}</div> : null}

      <Card title="Scope" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 340px)', gap: 12 }}>
          <FormField label="Entity">
            <SelectInput value={selectedEntityId} onChange={(event) => setSelectedEntityId(event.target.value)}>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
            </SelectInput>
          </FormField>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
        {stats.map((item) => (
          <Card key={item.label}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{item.note}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <Card title="Pay Runs">
          {loading ? <div style={{ padding: 24 }}>Loading payroll runs...</div> : (
            <SectionTable
              columns={[
                { key: 'name', label: 'Run' },
                { key: 'status', label: 'Status', render: (value) => humanize(value) },
                { key: 'approval_status', label: 'Approval', render: (value) => humanize(value) },
                { key: 'payment_date', label: 'Payment Date' },
                { key: 'employee_count', label: 'Employees' },
                { key: 'net_pay_total', label: 'Net Pay', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
              ]}
              rows={payrollRuns}
              emptyMessage="No payroll runs yet."
              actions={(row) => (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setSelectedRunId(String(row.id))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}>View</button>
                  {['draft', 'rejected'].includes(row.approval_status) ? <button type="button" onClick={() => handleRunAction(row.id, 'submit')} disabled={busyRunId === String(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #c084fc', background: '#faf5ff', cursor: 'pointer' }}>{busyRunId === String(row.id) ? 'Submitting...' : 'Submit'}</button> : null}
                  {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button type="button" onClick={() => handleRunAction(row.id, 'approve')} disabled={busyRunId === String(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #86efac', background: '#ecfdf5', cursor: 'pointer' }}>{busyRunId === String(row.id) ? 'Updating...' : 'Approve'}</button> : null}
                  {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button type="button" onClick={() => handleRunAction(row.id, 'reject')} disabled={busyRunId === String(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer' }}>{busyRunId === String(row.id) ? 'Updating...' : 'Reject'}</button> : null}
                  {(row.approval_status === 'approved' || row.approval_status === 'draft') && row.status === 'draft' ? <button type="button" onClick={() => handleRunAction(row.id, 'process')} disabled={busyRunId === String(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #86efac', background: '#ecfdf5', cursor: 'pointer' }}>{busyRunId === String(row.id) ? 'Processing...' : 'Process'}</button> : null}
                  {row.status === 'processed' ? <button type="button" onClick={() => handleRunAction(row.id, 'markPaid')} disabled={busyRunId === String(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: '#eff6ff', cursor: 'pointer' }}>{busyRunId === String(row.id) ? 'Updating...' : 'Mark Paid'}</button> : null}
                </div>
              )}
            />
          )}
        </Card>

        <Card title={selectedRun ? `Run Detail · ${selectedRun.name}` : 'Run Detail'}>
          {!selectedRun ? <div style={{ color: '#6b7280' }}>Select a payroll run to inspect payslips, filings, and the bank payment file.</div> : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Gross Pay</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(selectedRun.gross_pay_total, selectedEntity?.local_currency || 'USD')}</div></div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Approval</div><div style={{ fontSize: 18, fontWeight: 700 }}>{humanize(selectedRun.approval_status)}</div></div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Employee Benefits</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(selectedRun.employee_benefits_total, selectedEntity?.local_currency || 'USD')}</div></div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Employer Benefits</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(selectedRun.employer_benefits_total, selectedEntity?.local_currency || 'USD')}</div></div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Withholding</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(selectedRun.tax_withholding_total, selectedEntity?.local_currency || 'USD')}</div></div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Net Pay</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(selectedRun.net_pay_total, selectedEntity?.local_currency || 'USD')}</div></div>
              </div>

              <SectionTable
                columns={[
                  { key: 'staff_member_name', label: 'Employee' },
                  { key: 'gross_pay', label: 'Gross', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                  { key: 'tax_withholding', label: 'Withholding', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                  { key: 'deductions_total', label: 'Deductions', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                  { key: 'net_pay', label: 'Net', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                  { key: 'leave_balance_hours', label: 'Leave Balance' },
                ]}
                rows={selectedRun.payslips || []}
                emptyMessage="No payslips generated for this run yet."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                <Card title="Statutory Reports">
                  <SectionTable
                    columns={[
                      { key: 'report_type', label: 'Report', render: (value) => humanize(value) },
                      { key: 'jurisdiction', label: 'Jurisdiction' },
                      { key: 'status', label: 'Status', render: (value) => humanize(value) },
                      { key: 'due_date', label: 'Due Date' },
                    ]}
                    rows={statutoryReports}
                    emptyMessage="No statutory reports generated yet."
                  />
                </Card>
                <Card title="Bank Payment File">
                  {!selectedRunBankFile ? <div style={{ color: '#6b7280' }}>No bank payment file generated yet.</div> : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{selectedRunBankFile.file_name} · {humanize(selectedRunBankFile.file_format)}</div>
                      <pre style={{ margin: 0, padding: 12, background: '#0f172a', color: '#e2e8f0', borderRadius: 8, overflowX: 'auto', fontSize: 12, whiteSpace: 'pre-wrap' }}>{selectedRunBankFile.content}</pre>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Bank Originator" actions={<Button variant="secondary" size="small" onClick={() => openModal('originator', visibleOriginatorProfile)}>{visibleOriginatorProfile ? 'Edit Originator' : 'Add Originator'}</Button>}>
            {!visibleOriginatorProfile ? <div style={{ color: '#6b7280' }}>No company-level bank originator profile configured for this entity.</div> : (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{visibleOriginatorProfile.originator_name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Originator ID: {visibleOriginatorProfile.originator_identifier || '—'} | Bank: {visibleOriginatorProfile.originating_bank_name || '—'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Debit Account: {visibleOriginatorProfile.debit_account_number || '—'} | Routing: {visibleOriginatorProfile.debit_routing_number || visibleOriginatorProfile.debit_sort_code || '—'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>SEPA: {visibleOriginatorProfile.debit_iban || '—'} | {visibleOriginatorProfile.debit_swift_code || '—'}</div>
              </div>
            )}
          </Card>

          <Card title="Payroll Approval Matrices" actions={<Button variant="secondary" size="small" onClick={() => openModal('approval-matrix')}>Add Matrix</Button>}>
            <SectionTable
              columns={[
                { key: 'name', label: 'Matrix' },
                { key: 'minimum_amount', label: 'Min' },
                { key: 'maximum_amount', label: 'Max', render: (value) => value || 'No limit' },
                { key: 'reviewer_role_name', label: 'Reviewer' },
                { key: 'approver_role_name', label: 'Approver' },
              ]}
              rows={visibleApprovalMatrices}
              emptyMessage="No payroll approval matrices configured."
              actions={(row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => openModal('approval-matrix', row)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteApprovalMatrix(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                </div>
              )}
            />
          </Card>

          <Card title="Payroll Approval Delegations" actions={<Button variant="secondary" size="small" onClick={() => openModal('approval-delegation')}>Add Delegation</Button>}>
            <SectionTable
              columns={[
                { key: 'delegator_name', label: 'Delegator' },
                { key: 'delegate_name', label: 'Delegate' },
                { key: 'stage', label: 'Stage', render: (value) => humanize(value) },
                { key: 'minimum_amount', label: 'Min' },
                { key: 'maximum_amount', label: 'Max', render: (value) => value || 'No limit' },
              ]}
              rows={visibleApprovalDelegations}
              emptyMessage="No payroll delegations configured."
              actions={(row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => openModal('approval-delegation', row)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteApprovalDelegation(row.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                </div>
              )}
            />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Compensation Profiles" actions={<Button variant="secondary" size="small" onClick={() => openModal('profile')}>Add Profile</Button>}>
            <SectionTable
              columns={[
                { key: 'staff_member_name', label: 'Employee' },
                { key: 'base_salary', label: 'Base Salary', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                { key: 'pay_frequency', label: 'Frequency', render: (value) => humanize(value) },
                { key: 'income_tax_rate', label: 'Income Tax' },
                { key: 'employee_tax_rate', label: 'Employee Tax' },
              ]}
              rows={profiles}
              emptyMessage="No payroll profiles configured."
            />
          </Card>

          <Card title="Component Assignments" actions={<Button variant="secondary" size="small" onClick={() => openModal('assignment')}>Assign Component</Button>}>
            <SectionTable
              columns={[
                { key: 'staff_member_name', label: 'Employee' },
                { key: 'component_name', label: 'Component' },
                { key: 'component_type', label: 'Type', render: (value) => humanize(value) },
                { key: 'amount_override', label: 'Override', render: (value) => value ? formatMoney(value, selectedEntity?.local_currency || 'USD') : '—' },
              ]}
              rows={visibleAssignments}
              emptyMessage="No component assignments yet."
            />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Payroll Components" actions={<Button variant="secondary" size="small" onClick={() => openModal('component')}>Add Component</Button>}>
            <SectionTable
              columns={[
                { key: 'name', label: 'Component' },
                { key: 'component_type', label: 'Type', render: (value) => humanize(value) },
                { key: 'calculation_type', label: 'Calculation', render: (value) => humanize(value) },
                { key: 'amount', label: 'Amount', render: (value) => formatMoney(value, selectedEntity?.local_currency || 'USD') },
                { key: 'taxable', label: 'Taxable', render: (value) => (value ? 'Yes' : 'No') },
              ]}
              rows={components}
              emptyMessage="No payroll components defined."
            />
          </Card>

          <Card title="Leave Policies" actions={<Button variant="secondary" size="small" onClick={() => openModal('leave-type')}>Add Policy</Button>}>
            <SectionTable
              columns={[
                { key: 'name', label: 'Policy' },
                { key: 'accrual_hours_per_run', label: 'Accrual / Run' },
                { key: 'max_balance_hours', label: 'Max Balance' },
                { key: 'is_paid_leave', label: 'Paid', render: (value) => (value ? 'Yes' : 'No') },
              ]}
              rows={leaveTypes}
              emptyMessage="No leave policies configured."
            />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Leave Balances">
            <SectionTable
              columns={[
                { key: 'staff_member_name', label: 'Employee' },
                { key: 'leave_type_name', label: 'Policy' },
                { key: 'accrued_hours', label: 'Accrued' },
                { key: 'used_hours', label: 'Used' },
                { key: 'current_balance_hours', label: 'Balance' },
              ]}
              rows={leaveBalances}
              emptyMessage="Leave balances will appear as leave accrues or policies are assigned."
            />
          </Card>

          <Card title="Leave Requests" actions={<Button variant="secondary" size="small" onClick={() => openModal('leave-request')}>Add Request</Button>}>
            <SectionTable
              columns={[
                { key: 'staff_member_name', label: 'Employee' },
                { key: 'leave_type_name', label: 'Policy' },
                { key: 'start_date', label: 'Start' },
                { key: 'end_date', label: 'End' },
                { key: 'hours_requested', label: 'Hours' },
                { key: 'status', label: 'Status', render: (value) => humanize(value) },
              ]}
              rows={leaveRequests}
              emptyMessage="No leave requests yet."
              actions={(row) => (
                row.status === 'draft' || row.status === 'submitted'
                  ? <div style={{ display: 'flex', gap: 6 }}><button type="button" onClick={() => handleLeaveAction(row.id, 'approve')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #86efac', background: '#ecfdf5', cursor: 'pointer' }}>Approve</button><button type="button" onClick={() => handleLeaveAction(row.id, 'reject')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer' }}>Reject</button></div>
                  : '—'
              )}
            />
          </Card>
        </div>
      </div>

      <Modal
        isOpen={Boolean(modalType)}
        onClose={closeModal}
        title={{ run: 'Create Payroll Run', profile: 'Create Payroll Profile', component: 'Create Payroll Component', assignment: 'Assign Payroll Component', 'leave-type': 'Create Leave Policy', 'leave-request': 'Create Leave Request', 'approval-matrix': `${editingMatrixId ? 'Edit' : 'Create'} Payroll Approval Matrix`, 'approval-delegation': `${editingDelegationId ? 'Edit' : 'Create'} Payroll Approval Delegation`, originator: `${editingOriginatorId ? 'Edit' : 'Create'} Payroll Bank Originator` }[modalType] || 'Payroll'}
        footer={<><Button variant="secondary" onClick={closeModal}>Cancel</Button><Button variant="primary" onClick={submitModal} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {modalType === 'run' ? (
            <>
              <FormField label="Organization"><SelectInput value={runForm.organization} onChange={(event) => setRunForm((current) => ({ ...current, organization: event.target.value }))}>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              <FormField label="Entity"><SelectInput value={runForm.entity} onChange={(event) => setRunForm((current) => ({ ...current, entity: event.target.value }))}>{entities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              <FormField label="Run Name"><TextInput value={runForm.name} onChange={(event) => setRunForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Frequency"><SelectInput value={runForm.pay_frequency} onChange={(event) => setRunForm((current) => ({ ...current, pay_frequency: event.target.value }))}>{['weekly', 'biweekly', 'semimonthly', 'monthly'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
                <FormField label="Payment Date"><TextInput type="date" value={runForm.payment_date} onChange={(event) => setRunForm((current) => ({ ...current, payment_date: event.target.value }))} /></FormField>
              </div>
              <FormField label="Bank Export Format"><SelectInput value={runForm.requested_bank_file_format} onChange={(event) => setRunForm((current) => {
                const nextFormat = event.target.value;
                const nextFormatOption = bankExportOptions.find((item) => item.file_format === nextFormat);
                const nextInstitution = nextFormatOption?.institutions?.[0];
                const nextVariant = nextInstitution?.variants?.[0];
                return {
                  ...current,
                  requested_bank_file_format: nextFormat,
                  requested_bank_institution: nextInstitution?.institution_code || 'generic',
                  requested_bank_export_variant: nextVariant?.variant_code || 'standard',
                };
              })}>{bankExportOptions.map((item) => <option key={item.file_format} value={item.file_format}>{humanize(item.file_format)}</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Bank Institution"><SelectInput value={runForm.requested_bank_institution} onChange={(event) => setRunForm((current) => {
                  const nextInstitution = selectedExportFormat?.institutions?.find((item) => item.institution_code === event.target.value);
                  return {
                    ...current,
                    requested_bank_institution: event.target.value,
                    requested_bank_export_variant: nextInstitution?.variants?.[0]?.variant_code || current.requested_bank_export_variant,
                  };
                })}>{(selectedExportFormat?.institutions || []).map((item) => <option key={item.institution_code} value={item.institution_code}>{humanize(item.institution_code)}</option>)}</SelectInput></FormField>
                <FormField label="Export Variant"><SelectInput value={runForm.requested_bank_export_variant} onChange={(event) => setRunForm((current) => ({ ...current, requested_bank_export_variant: event.target.value }))}>{availableVariants.map((item) => <option key={item.variant_code} value={item.variant_code}>{item.label}</option>)}</SelectInput></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Period Start"><TextInput type="date" value={runForm.period_start} onChange={(event) => setRunForm((current) => ({ ...current, period_start: event.target.value }))} /></FormField>
                <FormField label="Period End"><TextInput type="date" value={runForm.period_end} onChange={(event) => setRunForm((current) => ({ ...current, period_end: event.target.value }))} /></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'profile' ? (
            <>
              <FormField label="Staff Member"><SelectInput value={profileForm.staff_member} onChange={(event) => setProfileForm((current) => ({ ...current, staff_member: event.target.value }))}>{staff.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Pay Frequency"><SelectInput value={profileForm.pay_frequency} onChange={(event) => setProfileForm((current) => ({ ...current, pay_frequency: event.target.value }))}>{['weekly', 'biweekly', 'semimonthly', 'monthly'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
                <FormField label="Salary Basis"><SelectInput value={profileForm.salary_basis} onChange={(event) => setProfileForm((current) => ({ ...current, salary_basis: event.target.value }))}>{['annual', 'monthly'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
              </div>
              <FormField label="Base Salary"><TextInput type="number" value={profileForm.base_salary} onChange={(event) => setProfileForm((current) => ({ ...current, base_salary: event.target.value }))} /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Income Tax Rate"><TextInput value={profileForm.income_tax_rate} onChange={(event) => setProfileForm((current) => ({ ...current, income_tax_rate: event.target.value }))} /></FormField>
                <FormField label="Employee Tax Rate"><TextInput value={profileForm.employee_tax_rate} onChange={(event) => setProfileForm((current) => ({ ...current, employee_tax_rate: event.target.value }))} /></FormField>
                <FormField label="Employer Tax Rate"><TextInput value={profileForm.employer_tax_rate} onChange={(event) => setProfileForm((current) => ({ ...current, employer_tax_rate: event.target.value }))} /></FormField>
              </div>
              <FormField label="Account Name"><TextInput value={profileForm.default_bank_account_name} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_account_name: event.target.value }))} /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Account Number"><TextInput value={profileForm.default_bank_account_number} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_account_number: event.target.value }))} /></FormField>
                <FormField label="Routing Number"><TextInput value={profileForm.default_bank_routing_number} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_routing_number: event.target.value }))} /></FormField>
                <FormField label="Sort Code"><TextInput value={profileForm.default_bank_sort_code} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_sort_code: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="IBAN"><TextInput value={profileForm.default_bank_iban} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_iban: event.target.value.toUpperCase() }))} /></FormField>
                <FormField label="SWIFT / BIC"><TextInput value={profileForm.default_bank_swift_code} onChange={(event) => setProfileForm((current) => ({ ...current, default_bank_swift_code: event.target.value.toUpperCase() }))} /></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'approval-matrix' ? (
            <>
              <FormField label="Name"><TextInput value={matrixForm.name} onChange={(event) => setMatrixForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              <FormField label="Description"><TextInput value={matrixForm.description} onChange={(event) => setMatrixForm((current) => ({ ...current, description: event.target.value }))} /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Minimum Amount"><TextInput type="number" min="0" step="0.01" value={matrixForm.minimum_amount} onChange={(event) => setMatrixForm((current) => ({ ...current, minimum_amount: event.target.value }))} /></FormField>
                <FormField label="Maximum Amount"><TextInput type="number" min="0" step="0.01" value={matrixForm.maximum_amount} onChange={(event) => setMatrixForm((current) => ({ ...current, maximum_amount: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Preparer Role"><SelectInput value={matrixForm.preparer_role} onChange={(event) => setMatrixForm((current) => ({ ...current, preparer_role: event.target.value }))}><option value="">Any</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
                <FormField label="Reviewer Role"><SelectInput value={matrixForm.reviewer_role} onChange={(event) => setMatrixForm((current) => ({ ...current, reviewer_role: event.target.value }))}><option value="">Optional</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
                <FormField label="Approver Role"><SelectInput value={matrixForm.approver_role} onChange={(event) => setMatrixForm((current) => ({ ...current, approver_role: event.target.value }))}><option value="">Optional</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'approval-delegation' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Delegator"><SelectInput value={delegationForm.delegator} onChange={(event) => setDelegationForm((current) => ({ ...current, delegator: event.target.value }))}>{staff.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</SelectInput></FormField>
                <FormField label="Delegate"><SelectInput value={delegationForm.delegate} onChange={(event) => setDelegationForm((current) => ({ ...current, delegate: event.target.value }))}>{staff.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</SelectInput></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Stage"><SelectInput value={delegationForm.stage} onChange={(event) => setDelegationForm((current) => ({ ...current, stage: event.target.value }))}>{['reviewer', 'approver'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
                <FormField label="Minimum Amount"><TextInput type="number" min="0" step="0.01" value={delegationForm.minimum_amount} onChange={(event) => setDelegationForm((current) => ({ ...current, minimum_amount: event.target.value }))} /></FormField>
                <FormField label="Maximum Amount"><TextInput type="number" min="0" step="0.01" value={delegationForm.maximum_amount} onChange={(event) => setDelegationForm((current) => ({ ...current, maximum_amount: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Start Date"><TextInput type="date" value={delegationForm.start_date} onChange={(event) => setDelegationForm((current) => ({ ...current, start_date: event.target.value }))} /></FormField>
                <FormField label="End Date"><TextInput type="date" value={delegationForm.end_date} onChange={(event) => setDelegationForm((current) => ({ ...current, end_date: event.target.value }))} /></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'originator' ? (
            <>
              <FormField label="Originator Name"><TextInput value={originatorForm.originator_name} onChange={(event) => setOriginatorForm((current) => ({ ...current, originator_name: event.target.value }))} /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Originator Identifier"><TextInput value={originatorForm.originator_identifier} onChange={(event) => setOriginatorForm((current) => ({ ...current, originator_identifier: event.target.value }))} /></FormField>
                <FormField label="Originating Bank"><TextInput value={originatorForm.originating_bank_name} onChange={(event) => setOriginatorForm((current) => ({ ...current, originating_bank_name: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Debit Account Name"><TextInput value={originatorForm.debit_account_name} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_account_name: event.target.value }))} /></FormField>
                <FormField label="Debit Account Number"><TextInput value={originatorForm.debit_account_number} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_account_number: event.target.value }))} /></FormField>
                <FormField label="Debit Routing"><TextInput value={originatorForm.debit_routing_number} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_routing_number: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Debit IBAN"><TextInput value={originatorForm.debit_iban} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_iban: event.target.value.toUpperCase() }))} /></FormField>
                <FormField label="Debit SWIFT / BIC"><TextInput value={originatorForm.debit_swift_code} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_swift_code: event.target.value.toUpperCase() }))} /></FormField>
                <FormField label="Debit Sort Code"><TextInput value={originatorForm.debit_sort_code} onChange={(event) => setOriginatorForm((current) => ({ ...current, debit_sort_code: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Entry Description"><TextInput value={originatorForm.company_entry_description} onChange={(event) => setOriginatorForm((current) => ({ ...current, company_entry_description: event.target.value }))} /></FormField>
                <FormField label="Discretionary Data"><TextInput value={originatorForm.company_discretionary_data} onChange={(event) => setOriginatorForm((current) => ({ ...current, company_discretionary_data: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Initiating Party Name"><TextInput value={originatorForm.initiating_party_name} onChange={(event) => setOriginatorForm((current) => ({ ...current, initiating_party_name: event.target.value }))} /></FormField>
                <FormField label="Initiating Party Identifier"><TextInput value={originatorForm.initiating_party_identifier} onChange={(event) => setOriginatorForm((current) => ({ ...current, initiating_party_identifier: event.target.value }))} /></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'component' ? (
            <>
              <FormField label="Entity"><SelectInput value={componentForm.entity} onChange={(event) => setComponentForm((current) => ({ ...current, entity: event.target.value }))}>{entities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                <FormField label="Code"><TextInput value={componentForm.code} onChange={(event) => setComponentForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
                <FormField label="Name"><TextInput value={componentForm.name} onChange={(event) => setComponentForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Type"><SelectInput value={componentForm.component_type} onChange={(event) => setComponentForm((current) => ({ ...current, component_type: event.target.value }))}>{['earning', 'benefit', 'deduction'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
                <FormField label="Calculation"><SelectInput value={componentForm.calculation_type} onChange={(event) => setComponentForm((current) => ({ ...current, calculation_type: event.target.value }))}>{['fixed', 'percent_of_base'].map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</SelectInput></FormField>
                <FormField label="Amount"><TextInput type="number" value={componentForm.amount} onChange={(event) => setComponentForm((current) => ({ ...current, amount: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={componentForm.taxable} onChange={(event) => setComponentForm((current) => ({ ...current, taxable: event.target.checked }))} /> Taxable</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={componentForm.employer_contribution} onChange={(event) => setComponentForm((current) => ({ ...current, employer_contribution: event.target.checked }))} /> Employer contribution</label>
              </div>
            </>
          ) : null}

          {modalType === 'assignment' ? (
            <>
              <FormField label="Staff Member"><SelectInput value={assignmentForm.staff_member} onChange={(event) => setAssignmentForm((current) => ({ ...current, staff_member: event.target.value }))}>{staff.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</SelectInput></FormField>
              <FormField label="Component"><SelectInput value={assignmentForm.component} onChange={(event) => setAssignmentForm((current) => ({ ...current, component: event.target.value }))}>{components.map((item) => <option key={item.id} value={item.id}>{item.name} ({humanize(item.component_type)})</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Amount Override"><TextInput type="number" value={assignmentForm.amount_override} onChange={(event) => setAssignmentForm((current) => ({ ...current, amount_override: event.target.value }))} /></FormField>
                <FormField label="Effective Start"><TextInput type="date" value={assignmentForm.effective_start} onChange={(event) => setAssignmentForm((current) => ({ ...current, effective_start: event.target.value }))} /></FormField>
                <FormField label="Effective End"><TextInput type="date" value={assignmentForm.effective_end} onChange={(event) => setAssignmentForm((current) => ({ ...current, effective_end: event.target.value }))} /></FormField>
              </div>
            </>
          ) : null}

          {modalType === 'leave-type' ? (
            <>
              <FormField label="Entity"><SelectInput value={leaveTypeForm.entity} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, entity: event.target.value }))}>{entities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                <FormField label="Code"><TextInput value={leaveTypeForm.code} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
                <FormField label="Name"><TextInput value={leaveTypeForm.name} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Accrual / Run"><TextInput type="number" value={leaveTypeForm.accrual_hours_per_run} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, accrual_hours_per_run: event.target.value }))} /></FormField>
                <FormField label="Max Balance"><TextInput type="number" value={leaveTypeForm.max_balance_hours} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, max_balance_hours: event.target.value }))} /></FormField>
                <FormField label="Carryover Limit"><TextInput type="number" value={leaveTypeForm.carryover_limit_hours} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, carryover_limit_hours: event.target.value }))} /></FormField>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={leaveTypeForm.is_paid_leave} onChange={(event) => setLeaveTypeForm((current) => ({ ...current, is_paid_leave: event.target.checked }))} /> Paid leave</label>
            </>
          ) : null}

          {modalType === 'leave-request' ? (
            <>
              <FormField label="Staff Member"><SelectInput value={leaveRequestForm.staff_member} onChange={(event) => setLeaveRequestForm((current) => ({ ...current, staff_member: event.target.value }))}>{staff.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</SelectInput></FormField>
              <FormField label="Leave Policy"><SelectInput value={leaveRequestForm.leave_type} onChange={(event) => setLeaveRequestForm((current) => ({ ...current, leave_type: event.target.value }))}>{leaveTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField label="Start"><TextInput type="date" value={leaveRequestForm.start_date} onChange={(event) => setLeaveRequestForm((current) => ({ ...current, start_date: event.target.value }))} /></FormField>
                <FormField label="End"><TextInput type="date" value={leaveRequestForm.end_date} onChange={(event) => setLeaveRequestForm((current) => ({ ...current, end_date: event.target.value }))} /></FormField>
                <FormField label="Hours"><TextInput type="number" value={leaveRequestForm.hours_requested} onChange={(event) => setLeaveRequestForm((current) => ({ ...current, hours_requested: event.target.value }))} /></FormField>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
