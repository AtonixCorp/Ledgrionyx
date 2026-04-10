import React, { useState, useRef } from 'react';
import './WorkspaceModules.css';

const ICON_MAP = {
  pdf: 'PDF', doc: 'DOC', docx: 'DOC', xls: 'XLS', xlsx: 'XLS',
  png: 'IMG', jpg: 'IMG', jpeg: 'IMG', gif: 'IMG', mp4: 'VID',
  zip: 'ZIP', csv: 'CSV', txt: 'TXT',
};

const getIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return ICON_MAP[ext] || 'FILE';
};

const WorkspaceFiles = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const [search, setSearch] = useState('');

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      added: new Date().toLocaleDateString(),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const fmt = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Files</h1>
          <p className="wsm-page-sub">Upload, manage, and share workspace documents and media.</p>
        </div>
        <button className="wsm-btn-primary" onClick={() => inputRef.current?.click()}>+ Upload File</button>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>

      <div
        className={`wsm-dropzone${isDragging ? ' wsm-dropzone-active' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        Drop files here or click to upload
      </div>

      {files.length > 0 && (
        <div className="wsm-toolbar">
          <input
            className="wsm-search"
            type="text"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {files.length === 0 ? (
        <div className="wsm-section">
          <div className="wsm-empty">No files uploaded yet.</div>
        </div>
      ) : (
        <div className="wsm-files-grid">
          {filtered.map((f, i) => (
            <div key={i} className="wsm-file-card">
              <span className="wsm-file-icon">{getIcon(f.name)}</span>
              <span className="wsm-file-name">{f.name}</span>
              <span className="wsm-file-meta">{fmt(f.size)} · {f.added}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="wsm-empty">No files match your search.</div>}
        </div>
      )}

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Members and above can upload and download files. Viewers can only view and download. Only Admins and Owners can delete files.
      </div>
    </div>
  );
};

export default WorkspaceFiles;
