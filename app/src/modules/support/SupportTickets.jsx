import React, { useState } from 'react';
import { PageHeader, Card, Button, Input, Table, Modal } from '../../components/ui';
import StandaloneModuleShell from '../../components/StandaloneModuleShell';

const ticketRows = [];

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#6b7280' };
const STATUS_COLORS = {
  Open: { bg: '#eff6ff', color: '#1d4ed8' },
  'In Progress': { bg: '#fff7ed', color: '#c2410c' },
  Resolved: { bg: '#f0fdf4', color: '#15803d' },
  Closed: { bg: '#f4f4f5', color: '#52525b' },
};

const BLANK_FORM = { subject: '', category: 'Accounting', priority: 'Medium', description: '' };

export default function SupportTickets() {
  const [tickets, setTickets] = useState(ticketRows);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [viewTicket, setViewTicket] = useState(null);

  const filtered = tickets.filter(t => {
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = () => {
    const id = `TKT-${String(tickets.length + 43).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    setTickets([{ ...form, id, status: 'Open', created: today, updated: today }, ...tickets]);
    setForm(BLANK_FORM);
    setShowModal(false);
  };

  const counts = {
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
    Closed: tickets.filter(t => t.status === 'Closed').length,
  };

  const columns = [
    { key: 'id', label: 'Ticket ID', width: 110, render: v => <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{v}</span> },
    { key: 'subject', label: 'Subject', render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
    { key: 'category', label: 'Category', width: 120 },
    {
      key: 'priority', label: 'Priority', width: 90,
      render: v => <span style={{ fontWeight: 700, fontSize: 12, color: PRIORITY_COLORS[v] || '#6b7280' }}>{v}</span>,
    },
    {
      key: 'status', label: 'Status', width: 110,
      render: v => {
        const s = STATUS_COLORS[v] || { bg: '#f4f4f5', color: '#52525b' };
        return (
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
            {v}
          </span>
        );
      },
    },
    { key: 'created', label: 'Created', width: 110, render: v => <span style={{ color: 'var(--color-silver-dark)', fontSize: 12 }}>{v}</span> },
    { key: 'updated', label: 'Last Update', width: 110, render: v => <span style={{ color: 'var(--color-silver-dark)', fontSize: 12 }}>{v}</span> },
  ];

  return (
    <StandaloneModuleShell title="Support Tickets" eyebrow="Support Surface" backLabel="Return to Console">
      <div className="module-page">
        <PageHeader
          title="Support Tickets"
          subtitle="Track and manage your support requests"
          actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ New Ticket</Button>}
        />

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Open', value: counts.Open, accent: '#1d4ed8' },
          { label: 'In Progress', value: counts['In Progress'], accent: '#c2410c' },
          { label: 'Resolved', value: counts.Resolved, accent: '#15803d' },
          { label: 'Closed', value: counts.Closed, accent: '#52525b' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search tickets or ticket ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </Card>

      {/* Ticket Table */}
      <Card header={`${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}`}>
        {filtered.length > 0 ? (
          <Table columns={columns} data={filtered} onRowClick={row => setViewTicket(row)} />
        ) : (
          <p className="empty-state">No tickets yet. Submit one to populate this box.</p>
        )}
      </Card>

      {/* Create Ticket Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          title="Submit New Support Ticket"
          onClose={() => { setShowModal(false); setForm(BLANK_FORM); }}
          footer={
            <>
              <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_FORM); }}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={!form.subject.trim() || !form.description.trim()}>Submit Ticket</Button>
            </>
          }
        >
          <div className="form-grid">
            <div>
              <div className="input-label">Subject <span className="required">*</span></div>
              <Input placeholder="Brief description of your issue" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="input-label">Category</div>
                <select className="filter-select" style={{ width: '100%' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Accounting', 'Billing', 'Reporting', 'Integrations', 'Security', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div className="input-label">Priority</div>
                <select className="filter-select" style={{ width: '100%' }} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="input-label">Description <span className="required">*</span></div>
              <textarea
                rows={5}
                placeholder="Please describe the issue in detail, including steps to reproduce if applicable…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid var(--border-color-default)', borderRadius: 6, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* View Ticket Detail */}
      {viewTicket && (
        <Modal
          isOpen={true}
          title={viewTicket.id}
          onClose={() => setViewTicket(null)}
          footer={<Button variant="secondary" onClick={() => setViewTicket(null)}>Close</Button>}
        >
          <div className="stack-md">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Status', value: viewTicket.status },
                { label: 'Priority', value: viewTicket.priority },
                { label: 'Category', value: viewTicket.category },
                { label: 'Created', value: viewTicket.created },
              ].map(f => (
                <div key={f.label} style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-silver-dark)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-silver-dark)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Subject</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{viewTicket.subject}</div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, fontSize: 13, color: 'var(--color-silver-dark)', lineHeight: 1.6 }}>
              No additional details provided. Our support team will follow up via email within 1 business day.
            </div>
          </div>
        </Modal>
      )}
      </div>
    </StandaloneModuleShell>
  );
}
