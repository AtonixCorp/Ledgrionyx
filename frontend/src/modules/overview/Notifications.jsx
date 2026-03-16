import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, PageHeader } from '../../components/ui';
import { notificationsAPI } from '../../services/api';

const TYPE_CONFIG = {
  alert: { icon: '!', badge: '#ef4444', text: 'Alert' },
  success: { icon: '+', badge: '#10b981', text: 'Success' },
  warning: { icon: '!', badge: '#f59e0b', text: 'Warning' },
  info: { icon: 'i', badge: '#3b82f6', text: 'Info' },
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifs(res.data.results || res.data);
    } catch (e) { console.error('Failed to load notifications', e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All' ? notifs
    : filter === 'Unread' ? notifs.filter(n => !n.is_read)
    : notifs.filter(n => n.notification_type === filter);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { setNotifs(prev => prev.map(n => ({ ...n, is_read: true }))); }
  };

  const handleDelete = async (id) => {
    try { await notificationsAPI.delete(id); load(); } catch (e) { console.error(e); }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={unreadCount > 0 && <Button variant="secondary" onClick={handleMarkAllRead}>Mark all as read</Button>}
      />
      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Unread', 'alert', 'success', 'warning', 'info'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: '1px solid var(--border-color-default)', cursor: 'pointer', background: filter === f ? 'var(--color-midnight)' : 'var(--color-white)', color: filter === f ? '#fff' : 'var(--color-midnight)', borderRadius: 6, textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </Card>
      <Card header={`${filtered.length} notification${filtered.length !== 1 ? 's' : ''}`}>
        {loading ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-silver-dark)' }}>Loading...</div>
        : filtered.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--color-silver-dark)', padding: '32px 0' }}>No notifications</p>
        : <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.notification_type] || TYPE_CONFIG.info;
              return (
                <div key={n.id} style={{ padding: '14px 16px', borderBottom: i !== filtered.length - 1 ? '1px solid var(--border-color-default)' : 'none', background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.03)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                      <span style={{ padding: '2px 6px', fontSize: 10, fontWeight: 700, background: cfg.badge, color: '#fff', borderRadius: 4 }}>{cfg.text}</span>
                      {!n.is_read && <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-silver-dark)', margin: '0 0 6px 0' }}>{n.message}</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-silver-dark)' }}>{new Date(n.created_at || n.created).toLocaleDateString()}</span>
                      {!n.is_read && <button onClick={() => handleMarkRead(n.id)} style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none' }}>Mark as read</button>}
                      <button onClick={() => handleDelete(n.id)} style={{ fontSize: 11, color: '#dc2626', cursor: 'pointer', background: 'none', border: 'none' }}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
      </Card>
    </div>
  );
}
