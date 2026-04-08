import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { workspaceMeetingsAPI, workspaceMembersAPI } from '../../../services/api';
import './WorkspaceModules.css';

const VIEWS = ['List', 'Upcoming', 'Past'];

const toInputDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toApiDateTime = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const WorkspaceMeetings = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [view, setView] = useState('Upcoming');
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionKey, setActionKey] = useState('');
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '' });

  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    try {
      const [meetingsResponse, membersResponse] = await Promise.all([
        workspaceMeetingsAPI.getAll(workspaceId),
        workspaceMembersAPI.getAll(workspaceId),
      ]);
      setMeetings(Array.isArray(meetingsResponse.data) ? meetingsResponse.data : []);
      setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load workspace meetings.');
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

  const canManageMeetings = ['owner', 'admin', 'member'].includes(currentMembership?.role);
  const now = Date.now();

  const filteredMeetings = useMemo(() => {
    const sorted = [...meetings].sort((left, right) => new Date(left.start_at) - new Date(right.start_at));
    if (view === 'List') return sorted;
    if (view === 'Upcoming') {
      return sorted.filter((meeting) => new Date(meeting.end_at).getTime() >= now);
    }
    return sorted.filter((meeting) => new Date(meeting.end_at).getTime() < now).reverse();
  }, [meetings, now, view]);

  const stats = useMemo(() => ({
    total: meetings.length,
    upcoming: meetings.filter((meeting) => new Date(meeting.end_at).getTime() >= now).length,
    past: meetings.filter((meeting) => new Date(meeting.end_at).getTime() < now).length,
  }), [meetings, now]);

  const resetForm = () => {
    setForm({ title: '', description: '', startAt: '', endAt: '' });
    setEditingMeeting(null);
    setShowModal(false);
  };

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setForm({ title: '', description: '', startAt: '', endAt: '' });
    setShowModal(true);
    setError('');
    setNotice('');
  };

  const handleOpenEdit = (meeting) => {
    setEditingMeeting(meeting);
    setForm({
      title: meeting.title || '',
      description: meeting.description || '',
      startAt: toInputDateTime(meeting.start_at),
      endAt: toInputDateTime(meeting.end_at),
    });
    setShowModal(true);
    setError('');
    setNotice('');
  };

  const handleSaveMeeting = async () => {
    if (!form.title.trim()) {
      setError('Meeting title is required.');
      return;
    }
    if (!form.startAt || !form.endAt) {
      setError('Start and end times are required.');
      return;
    }
    if (new Date(form.endAt).getTime() <= new Date(form.startAt).getTime()) {
      setError('End time must be after the start time.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      start_at: toApiDateTime(form.startAt),
      end_at: toApiDateTime(form.endAt),
    };
    try {
      if (editingMeeting) {
        const response = await workspaceMeetingsAPI.update(workspaceId, editingMeeting.id, payload);
        setMeetings((current) => current.map((meeting) => (meeting.id === editingMeeting.id ? response.data : meeting)));
        setNotice('Meeting updated successfully.');
      } else {
        const response = await workspaceMeetingsAPI.create(workspaceId, payload);
        setMeetings((current) => [...current, response.data]);
        setNotice('Meeting scheduled successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save meeting.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (meeting) => {
    if (!window.confirm(`Cancel ${meeting.title}?`)) {
      return;
    }
    setActionKey(meeting.id);
    setError('');
    setNotice('');
    try {
      await workspaceMeetingsAPI.delete(workspaceId, meeting.id);
      setMeetings((current) => current.filter((item) => item.id !== meeting.id));
      setNotice('Meeting cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel meeting.');
    } finally {
      setActionKey('');
    }
  };

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Meetings</h1>
          <p className="wsm-page-sub">Schedule and manage workspace meetings and calls.</p>
        </div>
        <button className="wsm-btn-primary" onClick={handleOpenCreate} disabled={!canManageMeetings && members.length > 0}>+ Schedule Meeting</button>
      </div>

      <div className="wsm-stats-row">
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Total Meetings</span>
          <span className="wsm-stat-value">{stats.total}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Upcoming</span>
          <span className="wsm-stat-value">{stats.upcoming}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Past</span>
          <span className="wsm-stat-value">{stats.past}</span>
        </div>
      </div>

      {error && <div className="wsm-alert wsm-alert-error">{error}</div>}
      {notice && <div className="wsm-alert wsm-alert-success">{notice}</div>}

      <div className="wsm-toolbar">
        <div className="wsm-chips">
          {VIEWS.map(v => (
            <button key={v} className={`wsm-chip${view === v ? ' active' : ''}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="wsm-event-list">
        {loading ? (
          <div className="wsm-empty">Loading meetings…</div>
        ) : filteredMeetings.length === 0 ? (
          <div className="wsm-empty">No {view.toLowerCase()} meetings. Schedule one to get started.</div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="wsm-event-card wsm-event-card-actions">
              <div className="wsm-event-time">{fmtDateTime(meeting.start_at)}</div>
              <div className="wsm-event-main">
                <div className="wsm-event-name">{meeting.title}</div>
                <div className="wsm-event-meta">
                  Ends {fmtDateTime(meeting.end_at)}
                  {meeting.created_by?.email ? ` · Created by ${meeting.created_by.email}` : ''}
                  {Array.isArray(meeting.participants) ? ` · ${meeting.participants.length} participant${meeting.participants.length === 1 ? '' : 's'}` : ''}
                </div>
                {meeting.description && <div className="wsm-event-meta">{meeting.description}</div>}
              </div>
              {canManageMeetings && (
                <div className="wsm-inline-actions">
                  <button className="wsm-btn-secondary" onClick={() => handleOpenEdit(meeting)}>Edit</button>
                  <button
                    className="wsm-btn-danger wsm-btn-danger-inline"
                    onClick={() => handleDeleteMeeting(meeting)}
                    disabled={actionKey === meeting.id}
                  >
                    {actionKey === meeting.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="wsm-modal-overlay" onClick={() => !saving && resetForm()}>
          <div className="wsm-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="wsm-modal-title">{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
            <p className="wsm-modal-sub">Workspace meetings use the live workspace scheduling API and automatically add the creator as a participant.</p>
            <div className="wsm-form">
              <div className="wsm-form-group">
                <label className="wsm-label">Title</label>
                <input className="wsm-input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Quarterly finance review" />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Description</label>
                <textarea className="wsm-textarea" rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Agenda, notes, and expected outcomes." />
              </div>
              <div className="wsm-form-row">
                <div className="wsm-form-group">
                  <label className="wsm-label">Start</label>
                  <input className="wsm-input" type="datetime-local" value={form.startAt} onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))} />
                </div>
                <div className="wsm-form-group">
                  <label className="wsm-label">End</label>
                  <input className="wsm-input" type="datetime-local" value={form.endAt} onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))} />
                </div>
              </div>
              <div className="wsm-modal-actions">
                <button className="wsm-btn-primary" onClick={handleSaveMeeting} disabled={saving}>{saving ? 'Saving…' : editingMeeting ? 'Save Changes' : 'Schedule Meeting'}</button>
                <button className="wsm-btn-secondary" onClick={resetForm} disabled={saving}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Members and above can schedule meetings. Viewers can only view meeting details.
      </div>
    </div>
  );
};

export default WorkspaceMeetings;
