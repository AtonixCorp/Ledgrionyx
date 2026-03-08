import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaBell, FaCog, FaCheck, FaTrash, FaFilter } from 'react-icons/fa';
import { notificationsAPI, notificationPreferencesAPI } from '../../../services/api';
import './Accounting.css';

const TABS = [
  { id: 'inbox', label: 'Inbox', icon: <FaBell /> },
  { id: 'preferences', label: 'Preferences', icon: <FaCog /> },
];

const TYPE_COLORS = {
  invoice_due: '#ed8936', payment_received: '#38a169', reconciliation_alert: '#4299e1',
  period_close: '#667eea', fx_alert: '#e53e3e', system: '#a0aec0', info: '#4299e1', warning: '#ed8936', error: '#e53e3e'
};

// ─── Inbox Tab ────────────────────────────────────────────────────────────────
const InboxTab = ({ entityId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = filter === 'unread'
        ? await notificationsAPI.getUnread({ entity: entityId })
        : await notificationsAPI.getAll({ entity: entityId });
      setNotifications(r.data.results || r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId, filter]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try { await notificationsAPI.markRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await notificationsAPI.delete(id); setNotifications(prev => prev.filter(n => n.id !== id)); } catch (e) { alert('Delete failed'); }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => notificationsAPI.markRead(n.id).catch(() => {})));
    await load();
    setMarkingAll(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaFilter style={{ color: '#a0aec0' }} />
          <select className="acct-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>
        {unreadCount > 0 && (
          <button className="btn-info btn-sm" onClick={handleMarkAllRead} disabled={markingAll}>
            {markingAll ? '...' : <><FaCheck /> Mark All Read ({unreadCount})</>}
          </button>
        )}
      </div>

      {loading ? <div className="acct-loading">Loading notifications...</div> : notifications.length === 0 ? (
        <div className="acct-empty">
          <FaBell style={{ fontSize: '2rem', color: '#e2e8f0', marginBottom: 8 }} />
          <div>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</div>
        </div>
      ) : (
        <div>
          {notifications.map(notif => (
            <div key={notif.id} className={`notif-item ${!notif.is_read ? 'unread' : ''}`}>
              {!notif.is_read && <div className="notif-dot" />}
              {notif.is_read && <div style={{ width: 9 }} />}
              <div className="notif-body">
                <div className="notif-title">
                  <span style={{ color: TYPE_COLORS[notif.notification_type] || '#4299e1', fontSize: '0.7rem', background: (TYPE_COLORS[notif.notification_type] || '#4299e1') + '22', padding: '1px 7px', borderRadius: 10, marginRight: 8, fontWeight: 600, textTransform: 'capitalize' }}>
                    {notif.notification_type?.replace(/_/g, ' ') || 'notification'}
                  </span>
                  {notif.title}
                </div>
                <div className="notif-msg">{notif.message}</div>
                <div className="notif-time">{timeAgo(notif.created_at)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!notif.is_read && <button className="btn-icon" title="Mark as read" onClick={() => handleMarkRead(notif.id)}><FaCheck /></button>}
                <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(notif.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Preferences Tab ──────────────────────────────────────────────────────────
const PreferencesTab = ({ entityId }) => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await notificationPreferencesAPI.get({ entity: entityId }); setPrefs(r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try { await notificationPreferencesAPI.update(prefs); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch (e) { alert('Save failed'); }
    setSaving(false);
  };

  if (loading) return <div className="acct-loading">Loading preferences...</div>;
  if (!prefs) return <div className="acct-empty">No preferences found for this entity.</div>;

  const PREF_LABELS = [
    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
    { key: 'invoice_due_alerts', label: 'Invoice Due Alerts', desc: 'Get notified when invoices are approaching due date' },
    { key: 'payment_received_alerts', label: 'Payment Received Alerts', desc: 'Get notified when payments are recorded' },
    { key: 'reconciliation_alerts', label: 'Reconciliation Alerts', desc: 'Get notified about reconciliation variances' },
    { key: 'period_close_alerts', label: 'Period Close Alerts', desc: 'Reminders for period-end close checklist' },
    { key: 'fx_rate_alerts', label: 'FX Rate Alerts', desc: 'Alerts when exchange rates move significantly' },
    { key: 'low_stock_alerts', label: 'Low Stock Alerts', desc: 'Notify when inventory drops below reorder level' },
    { key: 'budget_variance_alerts', label: 'Budget Variance Alerts', desc: 'Alerts when spending exceeds budget thresholds' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>Configure which notifications you receive for this entity</p>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : saved ? <><FaCheck /> Saved!</> : 'Save Preferences'}</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {PREF_LABELS.filter(({ key }) => key in prefs).map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#2d3748' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: 2 }}>{desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs[key] || false} onChange={() => handleToggle(key)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: 24, background: prefs[key] ? '#667eea' : '#cbd5e0', transition: '.2s' }}>
                <span style={{ position: 'absolute', left: prefs[key] ? 22 : 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Notifications Center ────────────────────────────────────────────────
const NotificationsCenter = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('inbox');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsAPI.getUnread({ entity: entityId })
      .then(r => setUnreadCount((r.data.results || r.data).length))
      .catch(() => {});
  }, [entityId]);

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1>
            <FaBell /> Notifications
            {unreadCount > 0 && <span style={{ background: '#e53e3e', color: 'white', borderRadius: '50%', fontSize: '0.7rem', padding: '2px 7px', marginLeft: 8, fontWeight: 700 }}>{unreadCount}</span>}
          </h1>
          <p>Stay on top of your accounting activity — alerts, reminders, and events</p>
        </div>
      </div>

      <div className="module-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="module-tab-content">
        {activeTab === 'inbox' && <InboxTab entityId={entityId} />}
        {activeTab === 'preferences' && <PreferencesTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default NotificationsCenter;
