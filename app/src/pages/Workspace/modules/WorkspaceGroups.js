import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { workspaceGroupsAPI, workspaceMembersAPI } from '../../../services/api';
import './WorkspaceModules.css';

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.username || user.email || `User ${user.id}`;
};

const WorkspaceGroups = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionKey, setActionKey] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');

  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    try {
      const [groupsResponse, membersResponse] = await Promise.all([
        workspaceGroupsAPI.getAll(workspaceId),
        workspaceMembersAPI.getAll(workspaceId),
      ]);
      setGroups(Array.isArray(groupsResponse.data) ? groupsResponse.data : []);
      setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load workspace groups.');
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

  const canManageGroups = ['owner', 'admin'].includes(currentMembership?.role);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter((group) => {
      const memberNames = (group.members || []).map((member) => getUserDisplayName(member.user)).join(' ');
      const haystack = [group.name, group.description, memberNames].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [groups, search]);

  const assignedMemberIds = useMemo(() => {
    const ids = new Set();
    groups.forEach((group) => {
      (group.members || []).forEach((member) => {
        if (member.user?.id) ids.add(member.user.id);
      });
    });
    return ids;
  }, [groups]);

  const stats = useMemo(() => ({
    totalGroups: groups.length,
    groupedMembers: assignedMemberIds.size,
    availableMembers: Math.max(members.length - assignedMemberIds.size, 0),
  }), [assignedMemberIds.size, groups.length, members.length]);

  const availableMembersForActiveGroup = useMemo(() => {
    if (!activeGroup) return [];
    const activeIds = new Set((activeGroup.members || []).map((member) => member.user?.id));
    return members.filter((member) => !activeIds.has(member.user?.id));
  }, [activeGroup, members]);

  const resetCreateForm = () => {
    setCreateForm({ name: '', description: '' });
    setShowCreate(false);
    setEditingGroup(null);
  };

  const handleSaveGroup = async () => {
    if (!createForm.name.trim()) {
      setError('Group name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingGroup) {
        const response = await workspaceGroupsAPI.update(workspaceId, editingGroup.id, {
          name: createForm.name.trim(),
          description: createForm.description.trim(),
        });
        setGroups((current) => current.map((group) => (group.id === editingGroup.id ? response.data : group)));
        if (activeGroup?.id === editingGroup.id) {
          setActiveGroup(response.data);
        }
        setNotice('Group updated successfully.');
      } else {
        const response = await workspaceGroupsAPI.create(workspaceId, {
          name: createForm.name.trim(),
          description: createForm.description.trim(),
        });
        setGroups((current) => [...current, response.data]);
        setNotice('Group created successfully.');
      }
      resetCreateForm();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save group.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setCreateForm({ name: group.name || '', description: group.description || '' });
    setShowCreate(true);
    setError('');
    setNotice('');
  };

  const handleOpenGroup = (group) => {
    setActiveGroup(group);
    setSelectedUserId('');
    setError('');
    setNotice('');
  };

  const refreshGroupsOnly = async () => {
    const response = await workspaceGroupsAPI.getAll(workspaceId);
    const nextGroups = Array.isArray(response.data) ? response.data : [];
    setGroups(nextGroups);
    if (activeGroup) {
      const updatedGroup = nextGroups.find((group) => group.id === activeGroup.id) || null;
      setActiveGroup(updatedGroup);
    }
  };

  const handleAddMemberToGroup = async () => {
    if (!activeGroup || !selectedUserId) {
      setError('Select a workspace member to add to this group.');
      return;
    }
    setActionKey(`add-${activeGroup.id}`);
    setError('');
    setNotice('');
    try {
      await workspaceGroupsAPI.addMember(workspaceId, activeGroup.id, { user_id: Number(selectedUserId) });
      setSelectedUserId('');
      await refreshGroupsOnly();
      setNotice('Member added to group.');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.user?.[0] || 'Failed to add member to group.');
    } finally {
      setActionKey('');
    }
  };

  const handleRemoveMemberFromGroup = async (groupId, userId) => {
    if (!window.confirm('Remove this member from the group?')) {
      return;
    }
    setActionKey(`remove-${groupId}-${userId}`);
    setError('');
    setNotice('');
    try {
      await workspaceGroupsAPI.removeMember(workspaceId, groupId, userId);
      await refreshGroupsOnly();
      setNotice('Member removed from group.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove member from group.');
    } finally {
      setActionKey('');
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Delete ${group.name}? This will remove all member assignments from the group.`)) {
      return;
    }
    setActionKey(`delete-${group.id}`);
    setError('');
    setNotice('');
    try {
      await workspaceGroupsAPI.delete(workspaceId, group.id);
      setGroups((current) => current.filter((item) => item.id !== group.id));
      if (activeGroup?.id === group.id) {
        setActiveGroup(null);
      }
      setNotice('Group deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete group.');
    } finally {
      setActionKey('');
    }
  };

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Groups</h1>
          <p className="wsm-page-sub">Organise members into groups for focused collaboration.</p>
        </div>
        <button className="wsm-btn-primary" onClick={() => setShowCreate(true)} disabled={!canManageGroups && members.length > 0}>+ Create Group</button>
      </div>

      <div className="wsm-stats-row">
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Groups</span>
          <span className="wsm-stat-value">{stats.totalGroups}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Grouped Members</span>
          <span className="wsm-stat-value">{stats.groupedMembers}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Available Members</span>
          <span className="wsm-stat-value">{stats.availableMembers}</span>
        </div>
      </div>

      {error && <div className="wsm-alert wsm-alert-error">{error}</div>}
      {notice && <div className="wsm-alert wsm-alert-success">{notice}</div>}

      <div className="wsm-toolbar">
        <input
          className="wsm-search"
          type="text"
          placeholder="Search groups…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="wsm-table-wrap">
        <table className="wsm-table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}><div className="wsm-empty">Loading groups…</div></td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={5}><div className="wsm-empty">No groups found. Create one to organize members.</div></td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <tr key={group.id}>
                  <td>
                    <div className="wsm-group-name">{group.name}</div>
                  </td>
                  <td>{group.description || '—'}</td>
                  <td>
                    <div className="wsm-group-pill-row">
                      {(group.members || []).length === 0 ? (
                        <span className="wsm-group-empty">No members</span>
                      ) : (
                        (group.members || []).slice(0, 3).map((member) => (
                          <span key={member.id} className="wsm-group-pill">{getUserDisplayName(member.user)}</span>
                        ))
                      )}
                      {(group.members || []).length > 3 && (
                        <span className="wsm-group-pill wsm-group-pill-muted">+{group.members.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td>{group.created_at ? new Date(group.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="wsm-inline-actions">
                      <button className="wsm-btn-secondary" onClick={() => handleOpenGroup(group)}>Manage Members</button>
                      {canManageGroups && (
                        <>
                          <button className="wsm-btn-secondary" onClick={() => handleEditGroup(group)}>Edit</button>
                          <button
                            className="wsm-btn-danger wsm-btn-danger-inline"
                            onClick={() => handleDeleteGroup(group)}
                            disabled={actionKey === `delete-${group.id}`}
                          >
                            {actionKey === `delete-${group.id}` ? 'Deleting…' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="wsm-modal-overlay" onClick={() => !saving && resetCreateForm()}>
          <div className="wsm-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">{editingGroup ? 'Edit Group' : 'Create Group'}</h2>
            <p className="wsm-modal-sub">Groups let you cluster workspace members for focused collaboration.</p>
            <div className="wsm-form">
              <div className="wsm-form-group">
                <label className="wsm-label">Group Name</label>
                <input
                  className="wsm-input"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Board Review Team"
                />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Description</label>
                <textarea
                  className="wsm-textarea"
                  rows={4}
                  value={createForm.description}
                  onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Used for quarterly review packs and approvals."
                />
              </div>
              <div className="wsm-modal-actions">
                <button className="wsm-btn-primary" onClick={handleSaveGroup} disabled={saving}>{saving ? 'Saving…' : editingGroup ? 'Save Changes' : 'Create Group'}</button>
                <button className="wsm-btn-secondary" onClick={resetCreateForm} disabled={saving}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeGroup && (
        <div className="wsm-modal-overlay" onClick={() => setActiveGroup(null)}>
          <div className="wsm-modal-card wsm-modal-card-wide" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">{activeGroup.name}</h2>
            <p className="wsm-modal-sub">{activeGroup.description || 'Manage the members assigned to this workspace group.'}</p>

            {canManageGroups && (
              <div className="wsm-group-manage-bar">
                <select
                  className="wsm-select"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  <option value="">Select a workspace member</option>
                  {availableMembersForActiveGroup.map((member) => (
                    <option key={member.id} value={member.user?.id}>{getUserDisplayName(member.user)}</option>
                  ))}
                </select>
                <button
                  className="wsm-btn-primary"
                  onClick={handleAddMemberToGroup}
                  disabled={actionKey === `add-${activeGroup.id}` || availableMembersForActiveGroup.length === 0}
                >
                  {actionKey === `add-${activeGroup.id}` ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            )}

            <div className="wsm-group-members-list">
              {(activeGroup.members || []).length === 0 ? (
                <div className="wsm-empty">No members assigned to this group yet.</div>
              ) : (
                activeGroup.members.map((member) => (
                  <div key={member.id} className="wsm-group-member-item">
                    <div className="wsm-member-cell">
                      <div className="wsm-member-avatar">{getUserDisplayName(member.user).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="wsm-member-name">{getUserDisplayName(member.user)}</div>
                        <div className="wsm-member-meta">{member.user?.email || 'No email'}</div>
                      </div>
                    </div>
                    {canManageGroups && (
                      <button
                        className="wsm-btn-danger wsm-btn-danger-inline"
                        onClick={() => handleRemoveMemberFromGroup(activeGroup.id, member.user?.id)}
                        disabled={actionKey === `remove-${activeGroup.id}-${member.user?.id}`}
                      >
                        {actionKey === `remove-${activeGroup.id}-${member.user?.id}` ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="wsm-modal-actions">
              <button className="wsm-btn-secondary" onClick={() => setActiveGroup(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Owners and Admins can create, edit, delete, and manage group membership. Members can view group membership.
      </div>
    </div>
  );
};

export default WorkspaceGroups;
