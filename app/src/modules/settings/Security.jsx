import React, { useState } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';
import StandaloneModuleShell from '../../components/StandaloneModuleShell';
import './Security.css';

export default function Security() {
  const [mfa, setMfa] = useState(true);
  const [ipRestrict, setIpRestrict] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  return (
    <StandaloneModuleShell title="Security" eyebrow="Admin Surface" backLabel="Return to Console">
      <div className="module-page">
        <PageHeader
          title="Security"
          subtitle="Configure authentication, session management, and access policies"
          actions={
            <Button variant="primary" size="small">Save Security Settings</Button>
          }
        />

        <div className="security-grid">
          <Card title="Authentication">
            <div className="security-options">
              {[
                { label: 'Require MFA for all users', value: mfa, setter: setMfa, desc: 'All team members must use two-factor authentication to sign in.' },
                { label: 'IP Address Restrictions', value: ipRestrict, setter: setIpRestrict, desc: 'Restrict access to specific IP addresses or CIDR ranges.' },
              ].map((item, i) => (
                <div key={i} className="security-option">
                  <div className="security-option-copy">
                    <div className="security-option-title">{item.label}</div>
                    <div className="security-option-desc">{item.desc}</div>
                  </div>
                  <button className={`security-toggle${item.value ? ' is-on' : ''}`} onClick={() => item.setter(!item.value)} aria-pressed={item.value}>
                    <span className="security-toggle-knob" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Session Management">
            <div className="security-session-row">
              <div className="security-session-copy">
                <div className="security-option-title">Session Timeout</div>
                <div className="security-option-desc">Automatically sign out inactive users after the specified duration.</div>
              </div>
              <select
                className="security-select"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
          </Card>

          <Card title="Security Summary">
            <div className="security-summary-list">
              {[
              { label: 'MFA Enabled', ok: mfa },
              { label: 'HTTPS / TLS Enforced', ok: true },
              { label: 'Audit Logging Active', ok: true },
              { label: 'IP Restrictions Active', ok: ipRestrict },
              { label: 'API Key Expiry Configured', ok: false },
            ].map((item, i) => (
              <div key={i} className="security-summary-item">
                <span className={`security-summary-label${item.ok ? ' is-ok' : ' is-muted'}`}>{item.label}</span>
              </div>
            ))}
            </div>
          </Card>
        </div>
      </div>
    </StandaloneModuleShell>
  );
}
