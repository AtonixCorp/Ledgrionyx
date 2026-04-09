import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { workspaceDepartmentsAPI, workspaceMembersAPI } from '../../../services/api';
import './WorkspaceModules.css';

const FINANCE_DEPARTMENT_TEMPLATES = [
  {
    name: 'Controllership',
    description: 'Owns accounting policy, chart of accounts governance, journal oversight, and close quality.',
    modules: 'Accounting, General Ledger, Close',
    costCenter: 'FIN-CTRL-100',
  },
  {
    name: 'Accounts Payable',
    description: 'Runs supplier operations, invoice workflows, payment approvals, and outbound obligations.',
    modules: 'Bills, Vendors, Payment Scheduling, AP',
    costCenter: 'FIN-AP-110',
  },
  {
    name: 'Accounts Receivable',
    description: 'Manages customer billing, collections, receivables aging, and cash application.',
    modules: 'Invoices, Customers, Collections, AR',
    costCenter: 'FIN-AR-120',
  },
  {
    name: 'Treasury',
    description: 'Handles cash positioning, liquidity planning, banking operations, and payment execution.',
    modules: 'Cash Bank, Treasury, Cashflow',
    costCenter: 'FIN-TRSY-130',
  },
  {
    name: 'Payroll',
    description: 'Coordinates payroll operations, pay runs, banking outputs, and payroll-linked obligations.',
    modules: 'Payroll',
    costCenter: 'FIN-PAY-140',
  },
  {
    name: 'Tax',
    description: 'Oversees tax calculations, monitoring, filings, deadlines, and cross-jurisdiction compliance.',
    modules: 'Tax Center, Tax Monitoring, Filing Assistant',
    costCenter: 'FIN-TAX-150',
  },
  {
    name: 'FP&A',
    description: 'Drives budgeting, forecasting, planning cycles, management targets, and variance analysis.',
    modules: 'Budgets, Forecasts, Variance Analysis',
    costCenter: 'FIN-FPA-160',
  },
  {
    name: 'Financial Reporting',
    description: 'Produces statements, management packs, analytics, board reporting, and formal financial outputs.',
    modules: 'Statements, Trial Balance, Analytics',
    costCenter: 'FIN-REP-170',
  },
  {
    name: 'Risk, Audit, and Compliance',
    description: 'Owns audit readiness, compliance controls, risk visibility, approvals, and close governance.',
    modules: 'Audit Trail, Period Close, Risk Exposure',
    costCenter: 'FIN-RISK-180',
  },
  {
    name: 'Intercompany and Consolidation',
    description: 'Coordinates intercompany operations, eliminations, consolidation control, and multi-entity reporting.',
    modules: 'Intercompany, Consolidation',
    costCenter: 'FIN-CONS-190',
  },
];

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.username || user.email || `User ${user.id}`;
};

const WorkspaceDepartments = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionKey, setActionKey] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '', owner_user_id: '', cost_center: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const seedingAttemptedRef = useRef(false);

  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    try {
      const [departmentsResponse, membersResponse] = await Promise.all([
        workspaceDepartmentsAPI.getAll(workspaceId),
        workspaceMembersAPI.getAll(workspaceId),
      ]);
      setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
      setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load workspace departments.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const currentMembership = useMemo(
    () => members.find((member) => String(member.user?.id) === String(user?.id)),
    [members, user?.id]
  );

  const canManageDepartments = ['owner', 'admin'].includes(currentMembership?.role);

  useEffect(() => {
    const seedDepartments = async () => {
      if (!workspaceId || loading || !canManageDepartments || departments.length > 0 || seedingAttemptedRef.current) {
        return;
      }
      seedingAttemptedRef.current = true;
      try {
        await Promise.all(
          FINANCE_DEPARTMENT_TEMPLATES.map((department) =>
            workspaceDepartmentsAPI.create(workspaceId, {
              name: department.name,
              description: department.description,
              owner_user_id: currentMembership?.user?.id || user?.id,
              cost_center: department.costCenter,
            })
          )
        );
        setNotice('Seeded the default finance department structure for this workspace.');
        await loadWorkspaceData();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to seed the default finance departments.');
      }
    };

    seedDepartments();
  }, [canManageDepartments, currentMembership?.user?.id, departments.length, loadWorkspaceData, loading, user?.id, workspaceId]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((department) => {
      const memberNames = (department.members || []).map((member) => getUserDisplayName(member.user)).join(' ');
      const haystack = [department.name, department.description, memberNames].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [departments, search]);

  const assignedMemberIds = useMemo(() => {
    const ids = new Set();
    departments.forEach((department) => {
      (department.members || []).forEach((member) => {
        if (member.user?.id) ids.add(member.user.id);
      });
    });
    return ids;
  }, [departments]);

  const stats = useMemo(() => ({
    totalDepartments: departments.length,
    staffedDepartments: departments.filter((department) => (department.members || []).length > 0).length,
    groupedMembers: assignedMemberIds.size,
  }), [assignedMemberIds.size, departments]);

  const availableMembersForActiveDepartment = useMemo(() => {
    if (!activeDepartment) return [];
    const activeIds = new Set((activeDepartment.members || []).map((member) => member.user?.id));
    return members.filter((member) => !activeIds.has(member.user?.id));
  }, [activeDepartment, members]);

  const resetCreateForm = () => {
    setCreateForm({ name: '', description: '', owner_user_id: '', cost_center: '' });
    setShowCreate(false);
    setEditingDepartment(null);
  };

  const handleSaveDepartment = async () => {
    if (!createForm.name.trim()) {
      setError('Department name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingDepartment) {
        const response = await workspaceDepartmentsAPI.update(workspaceId, editingDepartment.id, {
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          owner_user_id: createForm.owner_user_id ? Number(createForm.owner_user_id) : null,
          cost_center: createForm.cost_center.trim(),
        });
        setDepartments((current) => current.map((department) => (department.id === editingDepartment.id ? response.data : department)));
        if (activeDepartment?.id === editingDepartment.id) {
          setActiveDepartment(response.data);
        }
        setNotice('Department updated successfully.');
      } else {
        const response = await workspaceDepartmentsAPI.create(workspaceId, {
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          owner_user_id: createForm.owner_user_id ? Number(createForm.owner_user_id) : null,
          cost_center: createForm.cost_center.trim(),
        });
        setDepartments((current) => [...current, response.data]);
        setNotice('Department created successfully.');
      }
      resetCreateForm();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setCreateForm({
      name: department.name || '',
      description: department.description || '',
      owner_user_id: department.owner?.id ? String(department.owner.id) : '',
      cost_center: department.cost_center || '',
    });
    setShowCreate(true);
    setError('');
    setNotice('');
  };

  const handleOpenDepartment = (department) => {
    setActiveDepartment(department);
    setSelectedUserId('');
    setError('');
    setNotice('');
  };

  const refreshDepartmentsOnly = async () => {
    const response = await workspaceDepartmentsAPI.getAll(workspaceId);
    const nextDepartments = Array.isArray(response.data) ? response.data : [];
    setDepartments(nextDepartments);
    if (activeDepartment) {
      const updatedDepartment = nextDepartments.find((department) => department.id === activeDepartment.id) || null;
      setActiveDepartment(updatedDepartment);
    }
  };

  const handleAddMemberToDepartment = async () => {
    if (!activeDepartment || !selectedUserId) {
      setError('Select a workspace member to add to this department.');
      return;
    }
    setActionKey(`add-${activeDepartment.id}`);
    setError('');
    setNotice('');
    try {
      await workspaceDepartmentsAPI.addMember(workspaceId, activeDepartment.id, { user_id: Number(selectedUserId) });
      setSelectedUserId('');
      await refreshDepartmentsOnly();
      setNotice('Member added to department.');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.user?.[0] || 'Failed to add member to department.');
    } finally {
      setActionKey('');
    }
  };

  const handleRemoveMemberFromDepartment = async (departmentId, userId) => {
    if (!window.confirm('Remove this member from the department?')) {
      return;
    }
    setActionKey(`remove-${departmentId}-${userId}`);
    setError('');
    setNotice('');
    try {
      await workspaceDepartmentsAPI.removeMember(workspaceId, departmentId, userId);
      await refreshDepartmentsOnly();
      setNotice('Member removed from department.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove member from department.');
    } finally {
      setActionKey('');
    }
  };

  const handleDeleteDepartment = async (department) => {
    if (!window.confirm(`Delete ${department.name}? This will remove all member assignments from the department.`)) {
      return;
    }
    setActionKey(`delete-${department.id}`);
    setError('');
    setNotice('');
    try {
      await workspaceDepartmentsAPI.delete(workspaceId, department.id);
      setDepartments((current) => current.filter((item) => item.id !== department.id));
      if (activeDepartment?.id === department.id) {
        setActiveDepartment(null);
      }
      setNotice('Department deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete department.');
    } finally {
      setActionKey('');
    }
  };

  const departmentCards = useMemo(() => {
    return FINANCE_DEPARTMENT_TEMPLATES.map((template) => {
      const actualDepartment = departments.find((department) => department.name === template.name);
      return {
        ...template,
        actualDepartment,
        memberCount: actualDepartment?.members?.length || 0,
        ownerName: getUserDisplayName(actualDepartment?.owner),
        costCenter: actualDepartment?.cost_center || template.costCenter,
      };
    });
  }, [departments]);

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Departments</h1>
          <p className="wsm-page-sub">Finance operating structure, ownership, and team assignment for this workspace.</p>
        </div>
        <button className="wsm-btn-primary" onClick={() => setShowCreate(true)} disabled={!canManageDepartments && members.length > 0}>+ Create Department</button>
      </div>

      <div className="wsm-stats-row">
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Departments</span>
          <span className="wsm-stat-value">{stats.totalDepartments}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Staffed Departments</span>
          <span className="wsm-stat-value">{stats.staffedDepartments}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Assigned Members</span>
          <span className="wsm-stat-value">{stats.groupedMembers}</span>
        </div>
      </div>

      {error && <div className="wsm-alert wsm-alert-error">{error}</div>}
      {notice && <div className="wsm-alert wsm-alert-success">{notice}</div>}

      <section className="wsm-department-section">
        <div className="wsm-department-section-head">
          <div>
            <span className="wsm-section-kicker">Workspace Blueprint</span>
            <div className="wsm-section-title">Finance Org Structure</div>
          </div>
          <p className="wsm-department-section-copy">Each card maps a finance function to ownership, staffing, and operating scope inside this workspace.</p>
        </div>
        <div className="wsm-department-dashboard-grid">
          {departmentCards.map((department) => (
            <button
              key={department.name}
              type="button"
              className={`wsm-department-card${department.actualDepartment ? ' seeded' : ''}`}
              onClick={() => department.actualDepartment && handleOpenDepartment(department.actualDepartment)}
            >
              <div className="wsm-department-card-head">
                <h3>{department.name}</h3>
                <span>{department.memberCount} member{department.memberCount === 1 ? '' : 's'}</span>
              </div>
              <p>{department.description}</p>
              <div className="wsm-department-meta-row">
                <div className="wsm-department-meta">
                  <span className="wsm-department-meta-label">Owner</span>
                  <span>{department.ownerName}</span>
                </div>
                <div className="wsm-department-meta">
                  <span className="wsm-department-meta-label">Cost Center</span>
                  <span>{department.costCenter}</span>
                </div>
              </div>
              <div className="wsm-department-modules">{department.modules}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="wsm-department-section">
        <div className="wsm-department-section-head wsm-department-section-head-directory">
          <div>
            <span className="wsm-section-kicker">Directory</span>
            <div className="wsm-section-title">Department Directory</div>
          </div>
          <div className="wsm-toolbar wsm-toolbar-compact">
            <input
              className="wsm-search"
              type="text"
              placeholder="Search departments…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="wsm-empty wsm-empty-panel">Loading departments…</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="wsm-empty wsm-empty-panel">No departments found. Create one to organize finance ownership and members.</div>
        ) : (
          <div className="wsm-department-list-grid">
            {filteredDepartments.map((department) => (
              <article key={department.id} className="wsm-department-list-card">
                <div className="wsm-department-list-top">
                  <div>
                    <h3 className="wsm-department-list-title">{department.name}</h3>
                    <p className="wsm-department-list-description">{department.description || 'No department description added yet.'}</p>
                  </div>
                  <button className="wsm-btn-secondary" onClick={() => handleOpenDepartment(department)}>Manage Members</button>
                </div>

                <div className="wsm-department-list-meta">
                  <div className="wsm-department-statline">
                    <span className="wsm-department-meta-label">Owner</span>
                    <strong>{getUserDisplayName(department.owner)}</strong>
                  </div>
                  <div className="wsm-department-statline">
                    <span className="wsm-department-meta-label">Cost Center</span>
                    <strong>{department.cost_center || '—'}</strong>
                  </div>
                  <div className="wsm-department-statline">
                    <span className="wsm-department-meta-label">Created</span>
                    <strong>{department.created_at ? new Date(department.created_at).toLocaleDateString() : '—'}</strong>
                  </div>
                </div>

                <div className="wsm-department-member-summary">
                  <span className="wsm-department-meta-label">Members</span>
                  <div className="wsm-group-pill-row">
                    {(department.members || []).length === 0 ? (
                      <span className="wsm-group-empty">No members</span>
                    ) : (
                      (department.members || []).slice(0, 4).map((member) => (
                        <span key={member.id} className="wsm-group-pill">{getUserDisplayName(member.user)}</span>
                      ))
                    )}
                    {(department.members || []).length > 4 && (
                      <span className="wsm-group-pill wsm-group-pill-muted">+{department.members.length - 4} more</span>
                    )}
                  </div>
                </div>

                {canManageDepartments && (
                  <div className="wsm-inline-actions wsm-inline-actions-spread">
                    <button className="wsm-btn-secondary" onClick={() => handleEditDepartment(department)}>Edit</button>
                    <button
                      className="wsm-btn-danger wsm-btn-danger-inline"
                      onClick={() => handleDeleteDepartment(department)}
                      disabled={actionKey === `delete-${department.id}`}
                    >
                      {actionKey === `delete-${department.id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div className="wsm-modal-overlay" onClick={() => !saving && resetCreateForm()}>
          <div className="wsm-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">{editingDepartment ? 'Edit Department' : 'Create Department'}</h2>
            <p className="wsm-modal-sub">Departments let you align members to finance functions and operating ownership.</p>
            <div className="wsm-form">
              <div className="wsm-form-group">
                <label className="wsm-label">Department Name</label>
                <input
                  className="wsm-input"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Accounts Payable"
                />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Description</label>
                <textarea
                  className="wsm-textarea"
                  rows={4}
                  value={createForm.description}
                  onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Owns supplier operations, invoice workflows, and payment approvals."
                />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Department Owner</label>
                <select
                  className="wsm-select"
                  value={createForm.owner_user_id}
                  onChange={(event) => setCreateForm((current) => ({ ...current, owner_user_id: event.target.value }))}
                >
                  <option value="">No owner assigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.user?.id}>{getUserDisplayName(member.user)}</option>
                  ))}
                </select>
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Cost Center</label>
                <input
                  className="wsm-input"
                  value={createForm.cost_center}
                  onChange={(event) => setCreateForm((current) => ({ ...current, cost_center: event.target.value }))}
                  placeholder="FIN-AP-110"
                />
              </div>
              <div className="wsm-modal-actions">
                <button className="wsm-btn-primary" onClick={handleSaveDepartment} disabled={saving}>{saving ? 'Saving…' : editingDepartment ? 'Save Changes' : 'Create Department'}</button>
                <button className="wsm-btn-secondary" onClick={resetCreateForm} disabled={saving}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDepartment && (
        <div className="wsm-modal-overlay" onClick={() => setActiveDepartment(null)}>
          <div className="wsm-modal-card wsm-modal-card-wide" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">{activeDepartment.name}</h2>
            <p className="wsm-modal-sub">{activeDepartment.description || 'Manage the members assigned to this workspace department.'}</p>
            <div className="wsm-department-detail-row">
              <span><strong>Owner:</strong> {getUserDisplayName(activeDepartment.owner)}</span>
              <span><strong>Cost Center:</strong> {activeDepartment.cost_center || '—'}</span>
            </div>

            {canManageDepartments && (
              <div className="wsm-group-manage-bar">
                <select
                  className="wsm-select"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  <option value="">Select a workspace member</option>
                  {availableMembersForActiveDepartment.map((member) => (
                    <option key={member.id} value={member.user?.id}>{getUserDisplayName(member.user)}</option>
                  ))}
                </select>
                <button
                  className="wsm-btn-primary"
                  onClick={handleAddMemberToDepartment}
                  disabled={actionKey === `add-${activeDepartment.id}` || availableMembersForActiveDepartment.length === 0}
                >
                  {actionKey === `add-${activeDepartment.id}` ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            )}

            <div className="wsm-group-members-list">
              {(activeDepartment.members || []).length === 0 ? (
                <div className="wsm-empty">No members assigned to this department yet.</div>
              ) : (
                activeDepartment.members.map((member) => (
                  <div key={member.id} className="wsm-group-member-item">
                    <div className="wsm-member-cell">
                      <div className="wsm-member-avatar">{getUserDisplayName(member.user).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="wsm-member-name">{getUserDisplayName(member.user)}</div>
                        <div className="wsm-member-meta">{member.user?.email || 'No email'}</div>
                      </div>
                    </div>
                    {canManageDepartments && (
                      <button
                        className="wsm-btn-danger wsm-btn-danger-inline"
                        onClick={() => handleRemoveMemberFromDepartment(activeDepartment.id, member.user?.id)}
                        disabled={actionKey === `remove-${activeDepartment.id}-${member.user?.id}`}
                      >
                        {actionKey === `remove-${activeDepartment.id}-${member.user?.id}` ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="wsm-modal-actions">
              <button className="wsm-btn-secondary" onClick={() => setActiveDepartment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Owners and Admins can create, edit, delete, and manage department membership. Members can view department membership.
      </div>
    </div>
  );
};

export default WorkspaceDepartments;
