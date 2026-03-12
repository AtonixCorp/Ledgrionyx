import React from 'react';
import { PageHeader, Card } from '../../components/ui';

const mockPortalClients = [
  { name: 'Acme Corporation', lastLogin: '2025-01-31 09:45', documentsShared: 12, requestsPending: 2 },
  { name: 'Globex Holdings', lastLogin: '2025-01-28 14:22', documentsShared: 8, requestsPending: 0 },
];

export default function ClientPortal() {
  return (
    <div className="module-page">
      <PageHeader
        title="Client Portal"
        subtitle="Secure portal for clients to view reports, documents, and submit requests"
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Portal Users</div>
          <div className="stat-value">2</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Documents Shared</div>
          <div className="stat-value">20</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>2</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {mockPortalClients.map((c, i) => (
          <Card key={i} title={c.name}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-silver-dark)' }}>
                <span>Last Login</span>
                <span style={{ color: 'var(--color-midnight)' }}>{c.lastLogin}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-silver-dark)' }}>
                <span>Documents Shared</span>
                <span style={{ color: 'var(--color-midnight)', fontWeight: 600 }}>{c.documentsShared}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-silver-dark)' }}>
                <span>Pending Document Requests</span>
                <span style={{ color: c.requestsPending > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
                  {c.requestsPending}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="filter-btn active" style={{ flex: 1 }}>
                  View Documents
                </button>
                <button className="filter-btn" style={{ flex: 1 }}>
                  Reports
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Portal Security" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', fontSize: 13, color: 'var(--color-midnight)' }}>

          <div>
            <div style={{ fontWeight: 600 }}>Two-Factor Authentication Required</div>
            <div style={{ color: 'var(--color-silver-dark)' }}>All client portal access requires 2FA via email OTP</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
