import React, { useEffect, useState, useCallback } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { teamMembersAPI } from '../../services/api';
import './EnterpriseActionPages.css';

const EnterpriseTeam = () => {
  const { currentOrganization } = useEnterprise();
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'viewer', entities: [] });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const roles = [
    { code: 'org_owner', name: 'Organization Owner', description: 'Full access to organization and all entities' },
    { code: 'cfo', name: 'CFO', description: 'Access to all entities, financial data, and reporting' },
    { code: 'analyst', name: 'Finance Analyst', description: 'Can view and edit financials for assigned entities' },
    { code: 'viewer', name: 'Viewer', description: 'Read-only access to organization data' },
    { code: 'advisor', name: 'External Advisor', description: 'Limited access to specific entities only' },
  ];

  const loadTeam = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    setError('');
    try {
      const res = await teamMembersAPI.getAll({ organization: currentOrganization.id });
      setTeam(res.data.results || res.data);
    } catch (e) {
      setError('Failed to load team members. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  const getRoleObj = (code) => roles.find(r => r.code === code);

  const handleAddTeamMember = async () => {
    if (!formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await teamMembersAPI.update(editingId, { role: formData.role });
      } else {
        await teamMembersAPI.create({
          email: formData.email,
          role: formData.role,
          organization: currentOrganization?.id,
        });
      }
      setFormData({ email: '', role: 'viewer', entities: [] });
      setEditingId(null);
      setShowModal(false);
      await loadTeam();
    } catch (e) {
      alert(e.response?.data?.detail || e.response?.data?.email?.[0] || 'Failed to save team member.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTeamMember = (member) => {
    setFormData({ email: member.email || member.user_email || '', role: member.role || member.role_code || 'viewer', entities: [] });
    setEditingId(member.id);
    setShowModal(true);
  };

  const handleDeleteTeamMember = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await teamMembersAPI.delete(id);
      setTeam(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert('Failed to remove team member.');
    }
  };

  const handleAcceptInvite = (email) => {
    setTeam(team.map(m => m.email === email ? {...m, status: 'active', joinedDate: new Date().toISOString().split('T')[0]} : m));
  };

  const pendingInvites = team.filter((member) => member.status === 'pending').length;
  const activeMembers = team.filter((member) => member.status === 'active').length;

  return (
    <div className="team-container enterprise-action-page">
      <section className="action-page-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Workspace — Access Control</span>
          <h1 className="action-page-title">Team & Permissions</h1>
          <p className="action-page-subtitle">Control who can access the overview, who can act on entity data, and how responsibilities are distributed.</p>
          <div className="action-page-actions">
            <button className="btn-primary" onClick={() => {
              setEditingId(null);
              setFormData({ email: '', role: 'viewer', entities: [] });
              setShowModal(true);
            }}>
              Invite Team Member
            </button>
          </div>
        </div>
        <div className="action-page-badge">{currentOrganization?.name || 'Organization'}</div>
      </section>

      <section className="action-page-stats">
        <div className="action-page-stat">
          <span className="action-page-stat-label">Active Members</span>
          <span className="action-page-stat-value">{activeMembers}</span>
          <span className="action-page-stat-caption">People currently operating inside the organization</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Pending Invites</span>
          <span className="action-page-stat-value">{pendingInvites}</span>
          <span className="action-page-stat-caption">Invitations awaiting acceptance</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Role Profiles</span>
          <span className="action-page-stat-value">{roles.length}</span>
          <span className="action-page-stat-caption">Permission templates available for assignment</span>
        </div>
      </section>

      {/* Permission Matrix */}
      <div className="permission-matrix-section">
        <h2>Role Permissions Matrix</h2>
        <div className="matrix-table">
          <div className="matrix-header">
            <div className="col-permission">Permission</div>
            {roles.map(role => (
              <div key={role.code} className="col-role">{role.name}</div>
            ))}
          </div>

          {[
            { name: 'View Organization Overview', permissions: ['org_owner', 'cfo', 'analyst', 'viewer', 'advisor'] },
            { name: 'View Entities', permissions: ['org_owner', 'cfo', 'analyst', 'viewer', 'advisor'] },
            { name: 'Create/Edit Entities', permissions: ['org_owner', 'cfo'] },
            { name: 'Delete Entities', permissions: ['org_owner'] },
            { name: 'View Financials', permissions: ['org_owner', 'cfo', 'analyst', 'viewer'] },
            { name: 'Edit Financials', permissions: ['org_owner', 'cfo', 'analyst'] },
            { name: 'View Tax & Compliance', permissions: ['org_owner', 'cfo', 'analyst', 'viewer'] },
            { name: 'Manage Tax Filing', permissions: ['org_owner', 'cfo'] },
            { name: 'Access Reports', permissions: ['org_owner', 'cfo', 'analyst', 'viewer'] },
            { name: 'Export Data', permissions: ['org_owner', 'cfo', 'analyst'] },
            { name: 'Manage Team', permissions: ['org_owner'] },
            { name: 'Manage Billing', permissions: ['org_owner'] },
          ].map((perm, idx) => (
            <div key={idx} className="matrix-row">
              <div className="col-permission">{perm.name}</div>
              {roles.map(role => (
                <div
                  key={role.code}
                  className={`col-role${perm.permissions.includes(role.code) ? ' has-permission' : ''}`}
                >
                  {perm.permissions.includes(role.code) ? '✓' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Team Members List */}
      <div className="team-members-section">
        <h2>Team Members ({team.length})</h2>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading team...</div>
        ) : team.length === 0 ? (
          <div className="empty-state">
            <p>No team members yet. Invite someone to get started!</p>
          </div>
        ) : (
          <div className="team-list">
            {team.map(member => (
              <div key={member.id} className={`team-card ${member.status}`}>
                <div className="member-info">
                  <div className="member-avatar">{(member.name || member.user_email || 'U').charAt(0)}</div>
                  <div className="member-details">
                    <div className="member-name">{member.name || member.user_email}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>

                <div className="member-role">
                  <div className="role-badge" style={{backgroundColor: member.status === 'pending' ? 'var(--color-warning-light)' : 'var(--color-cyan-light)'}}>
                    {getRoleObj(member.role)?.name}
                  </div>
                </div>

                <div className="member-status">
                  <span className={`status-badge ${member.status}`}>
                    {member.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                  {member.joinedDate && <div className="joined-date">{member.joinedDate}</div>}
                </div>

                {member.status === 'pending' && (
                  <div className="pending-actions">
                    <button className="btn-link" onClick={() => handleAcceptInvite(member.email)}>Invite Sent
                    </button>
                  </div>
                )}

                <div className="member-actions">
                  <button
                    className="btn-icon"
                    title="Edit"
                    onClick={() => handleEditTeamMember(member)}
                  >
                    ✎
                  </button>
                  <button
                    className="btn-icon delete"
                    title="Remove"
                    onClick={() => handleDeleteTeamMember(member.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Team Member' : 'Invite Team Member'}</h2>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="member@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={editingId !== null}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {roles.map(role => (
                  <option key={role.code} value={role.code}>
                    {role.name}
                  </option>
                ))}
              </select>
              <div className="role-description">
                {getRoleObj(formData.role)?.description}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAddTeamMember} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Send Invite'}
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="audit-log-section">
        <h2>Team Activity</h2>
        <div className="audit-list">
          {[
            { action: 'Lisa Chen invited to team', date: '2025-01-10', by: 'John Smith' },
            { action: 'Mike Davis role changed to Analyst', date: '2025-01-08', by: 'Sarah Johnson' },
            { action: 'Sarah Johnson added to team', date: '2025-01-05', by: 'John Smith' },
          ].map((log, idx) => (
            <div key={idx} className="audit-item">
              <div className="audit-action">{log.action}</div>
              <div className="audit-meta">
                <span className="audit-date">{log.date}</span>
                <span className="audit-by">by {log.by}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTeam;
