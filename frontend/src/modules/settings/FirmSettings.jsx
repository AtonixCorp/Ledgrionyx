import React, { useState } from 'react';
import { PageHeader, Card, Button, Input } from '../../components/ui';
import { FaCog, FaSave } from 'react-icons/fa';

export default function FirmSettings() {
  const [form, setForm] = useState({
    firmName: 'ATC Capital LLC',
    legalName: 'ATC Capital Management LLC',
    taxId: '88-1234567',
    address: '350 Fifth Avenue, Suite 4200, New York, NY 10118',
    phone: '+1 (212) 555-0100',
    email: 'admin@atccapital.com',
    website: 'https://atccapital.com',
    fiscalYearEnd: '12',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  const handleChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="module-page">
      <PageHeader
        title="Firm Settings"
        subtitle="Configure your organization's core details and preferences"
        icon={<FaCog />}
        actions={
          <Button variant="primary" size="small" icon={<FaSave />}>Save Changes</Button>
        }
      />

      <div className="two-col-grid">
        <Card title="Organization Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Firm Display Name" value={form.firmName} onChange={handleChange('firmName')} />
            <Input label="Legal Entity Name" value={form.legalName} onChange={handleChange('legalName')} />
            <Input label="Tax ID / EIN" value={form.taxId} onChange={handleChange('taxId')} />
            <Input label="Business Address" value={form.address} onChange={handleChange('address')} />
            <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
            <Input label="Website" value={form.website} onChange={handleChange('website')} />
          </div>
        </Card>

        <Card title="Accounting Preferences">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2c3e50', display: 'block', marginBottom: 6 }}>
                Fiscal Year End Month
              </label>
              <select
                value={form.fiscalYearEnd}
                onChange={handleChange('fiscalYearEnd')}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                  <option key={i} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2c3e50', display: 'block', marginBottom: 6 }}>
                Base Currency
              </label>
              <select
                value={form.currency}
                onChange={handleChange('currency')}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#2c3e50', display: 'block', marginBottom: 6 }}>
                Accounting Standard
              </label>
              <select
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
              >
                <option>GAAP (US Generally Accepted)</option>
                <option>IFRS (International)</option>
                <option>IFRS for SMEs</option>
              </select>
            </div>
            <Input label="Timezone" value={form.timezone} onChange={handleChange('timezone')} />
          </div>
        </Card>
      </div>
    </div>
  );
}
