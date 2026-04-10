import React, { useState } from 'react';
import './WorkspaceModules.css';

const FOLDERS = ['Inbox', 'Sent', 'Drafts', 'Trash'];

const WorkspaceEmail = () => {
  const [folder, setFolder] = useState('Inbox');
  const [composing, setComposing] = useState(false);

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Email</h1>
          <p className="wsm-page-sub">Workspace-scoped email inbox and messaging.</p>
        </div>
        <button className="wsm-btn-primary" onClick={() => setComposing(true)}>+ Compose</button>
      </div>

      <div className="wsm-email-shell">
        {/* Folder list */}
        <div className="wsm-folder-panel">
          <div className="wsm-section">
            {FOLDERS.map(f => (
              <div
                key={f}
                onClick={() => setFolder(f)}
                className={`wsm-folder-item${folder === f ? ' wsm-folder-item-active' : ''}`}
              >
                {f}
                {f === 'Inbox' && <span className="wsm-folder-count">0</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Email list */}
        <div className="wsm-email-list-panel">
          <div className="wsm-section">
            <div className="wsm-section-title">{folder}</div>
            <div className="wsm-empty">No messages in {folder.toLowerCase()}.</div>
          </div>
        </div>
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="wsm-modal-overlay">
          <div className="wsm-modal-card wsm-modal-card-wide">
            <h3 className="wsm-modal-title">New Message</h3>
            <div className="wsm-form">
              <div className="wsm-form-group">
                <label className="wsm-label">To</label>
                <input className="wsm-input" placeholder="Recipient email…" />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Subject</label>
                <input className="wsm-input" placeholder="Subject…" />
              </div>
              <div className="wsm-form-group">
                <label className="wsm-label">Message</label>
                <textarea className="wsm-textarea" rows={5} placeholder="Write your message…" />
              </div>
              <div className="wsm-modal-actions">
                <button className="wsm-btn-secondary" onClick={() => setComposing(false)}>Cancel</button>
                <button className="wsm-btn-primary">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Members and above can send and receive messages. Viewers have read-only access. This module can be disabled in Settings.
      </div>
    </div>
  );
};

export default WorkspaceEmail;
