import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const documentRows = [];

const columns = [
  { key: 'name', header: 'Document Name' },
  { key: 'type', header: 'Type' },
  { key: 'size', header: 'Size' },
  { key: 'uploaded', header: 'Uploaded' },
  { key: 'uploader', header: 'Uploaded By' },
  { key: 'tags', header: 'Tags' },
];

const BLANK_DOC = { name: '', type: '', tags: '', notes: '' };

export default function DocumentVault() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [docList, setDocList] = useState(documentRows);
  const [form, setForm] = useState(BLANK_DOC);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const id = `DOC-${String(docList.length + 1).padStart(3, '0')}`;
    setDocList(prev => [...prev, { id, name: form.name, type: form.type || '—', size: '—', uploaded: today, uploader: 'You', tags: form.tags || '' }]);
    setForm(BLANK_DOC);
    setShowModal(false);
  };

  const filtered = docList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="module-page">
      <PageHeader
        title="Document Vault"
        subtitle="Secure storage for financial documents, contracts, and compliance files"
        actions={
          <>
            <Button variant="secondary" size="small">Download All</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Upload Document
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Documents</div>
          <div className="stat-value">{docList.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Storage</div>
          <div className="stat-value">0 MB</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Recent Uploads</div>
          <div className="stat-value">0</div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>

          <input
            type="text"
            placeholder="Search documents by name, type, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid var(--border-color-default)',
              borderRadius: 6, fontSize: 13, outline: 'none',
            }}
          />
        </div>
        {filtered.length > 0 ? <Table columns={columns} data={filtered} /> : <p className="empty-state">No documents yet. Upload one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_DOC); }} title="Upload Document" size="medium">
        <div className="form-grid">
          <Input label="Document Name" required value={form.name} onChange={set('name')} />
          <Input label="Document Type" placeholder="Audit, Contract, Tax, Legal..." value={form.type} onChange={set('type')} />
          <Input label="Tags" placeholder="Comma-separated tags" value={form.tags} onChange={set('tags')} />
          <Input label="Notes" value={form.notes} onChange={set('notes')} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-midnight)', display: 'block', marginBottom: 6 }}>File
          </label>
          <input type="file" style={{ fontSize: 13 }} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_DOC); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim()}>Upload</Button>
        </div>
      </Modal>
    </div>
  );
}
