import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { workspaceMembersAPI } from '../../../services/api';
import './WorkspaceModules.css';

const ROLES = ['all', 'owner', 'admin', 'member', 'viewer'];
const MANAGEABLE_ROLES = ['admin', 'member', 'viewer'];

const formatRoleLabel = (role) => {
  if (!role) return 'Unknown';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getMemberName = (member) => {
  const first = member.user?.first_name || '';
  const last = member.user?.last_name || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || member.user?.username || member.user?.email || `User ${member.user?.id || ''}`.trim();
};

const WorkspaceMembers = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ userId: '', role: 'member' });

  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    try {
      const response = await workspaceMembersAPI.getAll(workspaceId);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load workspace members.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const currentMembership = useMemo(
    () => members.find((member) => String(member.user?.id) === String(user?.id)),
    [members, user?.id]
  );

  const canManageMembers = ['owner', 'admin'].includes(currentMembership?.role);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      if (filterRole !== 'all' && member.role !== filterRole) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [
        getMemberName(member),
        member.user?.email,
        member.user?.username,
        member.role,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filterRole, members, search]);

  const roleCounts = useMemo(() => {
    return members.reduce(
      (accumulator, member) => {
        accumulator.total += 1;
        accumulator[member.role] = (accumulator[member.role] || 0) + 1;
        return accumulator;
      },
      { total: 0, owner: 0, admin: 0, member: 0, viewer: 0 }
    );
  }, [members]);

  const handleInviteMember = async () => {
    if (!inviteForm.userId.trim()) {
      setError('User ID is required to add a workspace member.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      await workspaceMembersAPI.create(workspaceId, {
        user_id: Number(inviteForm.userId),
        role: inviteForm.role,
      });
      setInviteForm({ userId: '', role: 'member' });
      setShowInvite(false);
      setNotice('Member added successfully.');
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.user?.[0] || 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (member, nextRole) => {
    if (!canManageMembers || member.role === 'owner' || member.role === nextRole) {
      return;
    }
    setActionUserId(member.user?.id);
    setError('');
    setNotice('');
    try {
      const response = await workspaceMembersAPI.updateRole(workspaceId, member.user.id, { role: nextRole });
      setMembers((current) => current.map((item) => (item.user?.id === member.user?.id ? response.data : item)));
      setNotice(`Updated ${getMemberName(member)} to ${formatRoleLabel(nextRole)}.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update member role.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!canManageMembers || member.role === 'owner') {
      return;
    }
    if (!window.confirm(`Remove ${getMemberName(member)} from this workspace?`)) {
      return;
    }

    setActionUserId(member.user?.id);
    setError('');
    setNotice('');
    try {
      await workspaceMembersAPI.delete(workspaceId, member.user.id);
      setMembers((current) => current.filter((item) => item.user?.id !== member.user?.id));
      setNotice(`Removed ${getMemberName(member)} from the workspace.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove member.');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Members</h1>
          <p className="wsm-page-sub">Manage workspace membership and role assignments.</p>
        </div>
        <button className="wsm-btn-primary" onClick={() => setShowInvite(true)} disabled={!canManageMembers && members.length > 0}>
          + Add Member
        </button>
      </div>

      <div className="wsm-stats-row">
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Total Members</span>
          <span className="wsm-stat-value">{roleCounts.total}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Admins</span>
          <span className="wsm-stat-value">{roleCounts.admin}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Members</span>
          <span className="wsm-stat-value">{roleCounts.member}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Viewers</span>
          <span className="wsm-stat-value">{roleCounts.viewer}</span>
        </div>
      </div>

      {error && <div className="wsm-alert wsm-alert-error">{error}</div>}
      {notice && <div className="wsm-alert wsm-alert-success">{notice}</div>}

      <div className="wsm-toolbar">
        <input
          className="wsm-search"
          type="text"
          placeholder="Search members…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="wsm-chips">
          {ROLES.map((role) => (
            <button key={role} className={`wsm-chip${filterRole === role ? ' active' : ''}`} onClick={() => setFilterRole(role)}>
              {role === 'all' ? 'All' : formatRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      <div className="wsm-table-wrap">
        <table className="wsm-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}><div className="wsm-empty">Loading members…</div></td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6}><div className="wsm-empty">No members match the current filters.</div></td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const isOwner = member.role === 'owner';
                const isBusy = actionUserId === member.user?.id;
                const isSelf = String(member.user?.id) === String(user?.id);
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="wsm-member-cell">
                        <div className="wsm-member-avatar">{getMemberName(member).charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="wsm-member-name">{getMemberName(member)}</div>
                          {isSelf && <div className="wsm-member-meta">You</div>}
                        </div>
                      </div>
                    </td>
                    <td>{member.user?.email || '—'}</td>
                    <td>{member.user?.username || '—'}</td>
                    <td>
                      {canManageMembers && !isOwner ? (
                        <select
                          className="wsm-select wsm-inline-select"
                          value={member.role}
                          onChange={(event) => handleRoleChange(member, event.target.value)}
                          disabled={isBusy}
                        >
                          {MANAGEABLE_ROLES.map((role) => (
                            <option key={role} value={role}>{formatRoleLabel(role)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`wsm-badge wsm-badge-${member.role}`}>{formatRoleLabel(member.role)}</span>
                      )}
                    </td>
                    <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        className="wsm-btn-danger wsm-btn-danger-inline"
                        onClick={() => handleRemoveMember(member)}
                        disabled={!canManageMembers || isOwner || isBusy}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="wsm-modal-overlay" onClick={() => !saving && setShowInvite(false)}>
          <div className="wsm-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">Add Workspace Member</h2>
            <p className="wsm-modal-sub">This backend currently accepts a numeric user ID for member assignment.</p>
            <div className="wsm-form">
              <div className="wsm-form-group">
                <label className="wsm-label">User ID</label>
                <input
                  className="wsm-input"
                  type="number"
                  min="1"
                  value={inviteForm.userId}
                  onChange={(event) => setInviteForm((current) => ({ ...current, userId: event.target.value }))}
                  placeholder="Enter existing user ID"
                />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Role</label>
                <select
                  className="wsm-select"
                  value={inviteForm.role}
                  onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))}
                >
                  {MANAGEABLE_ROLES.map((role) => (
                    <option key={role} value={role}>{formatRoleLabel(role)}</option>
                  ))}
                </select>
              </div>
              <div className="wsm-modal-actions">
                <button className="wsm-btn-primary" onClick={handleInviteMember} disabled={saving}>
                  {saving ? 'Adding…' : 'Add Member'}
                </button>
                <button className="wsm-btn-secondary" onClick={() => setShowInvite(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Owners and Admins can add or remove members. Role changes are logged in the audit trail.
      </div>
    </div>
  );
};

export default WorkspaceMembers;
