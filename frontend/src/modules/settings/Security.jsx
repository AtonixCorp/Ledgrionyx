import React, { useState } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';
import { FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Security() {
  const [mfa, setMfa] = useState(true);
  const [ipRestrict, setIpRestrict] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  return (
    <div className="module-page">
      <PageHeader
        title="Security"
        subtitle="Configure authentication, session management, and access policies"
        icon={<FaShieldAlt />}
        actions={
          <Button variant="primary" size="small">Save Security Settings</Button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card title="Authentication">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Require MFA for all users', value: mfa, setter: setMfa, desc: 'All team members must use two-factor authentication to sign in.' },
              { label: 'IP Address Restrictions', value: ipRestrict, setter: setIpRestrict, desc: 'Restrict access to specific IP addresses or CIDR ranges.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#7a8fa6', marginTop: 2 }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: item.value ? '#27ae60' : '#e2e8f0',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: item.value ? 24 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Session Management">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>Session Timeout</div>
              <div style={{ fontSize: 12, color: '#7a8fa6', marginTop: 2 }}>Automatically sign out inactive users after the specified duration.</div>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
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
          {[
            { label: 'MFA Enabled', ok: mfa },
            { label: 'HTTPS / TLS Enforced', ok: true },
            { label: 'Audit Logging Active', ok: true },
            { label: 'IP Restrictions Active', ok: ipRestrict },
            { label: 'API Key Expiry Configured', ok: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f0f2f5', fontSize: 13 }}>
              {item.ok
                ? <FaCheckCircle style={{ color: '#27ae60', fontSize: 16 }} />
                : <FaTimesCircle style={{ color: '#e74c3c', fontSize: 16 }} />
              }
              <span style={{ color: item.ok ? '#2c3e50' : '#7a8fa6' }}>{item.label}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
