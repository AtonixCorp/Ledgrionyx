import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import { 
  FaCog, FaShieldAlt, FaUserCog, FaBell, FaPlug, 
  FaFileInvoice, FaLink, FaKey, FaToggleOn, FaToggleOff,
  FaSlack, FaGoogle, FaMicrosoft, FaSave, FaCheck, FaInfo,
  FaDatabase, FaLock, FaServer, FaExclamationTriangle
} from 'react-icons/fa';
import './EnterpriseSettings.css';

// Comprehensive list of countries served by Atonix Capital
const COUNTRIES_SERVED = [
  // Africa - West
  { code: 'NG', name: 'Nigeria', region: 'West Africa', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', region: 'West Africa', currency: 'GHS' },
  { code: 'CI', name: 'Côte d\'Ivoire', region: 'West Africa', currency: 'XOF' },
  { code: 'SN', name: 'Senegal', region: 'West Africa', currency: 'XOF' },
  { code: 'BJ', name: 'Benin', region: 'West Africa', currency: 'XOF' },
  { code: 'TG', name: 'Togo', region: 'West Africa', currency: 'XOF' },
  { code: 'LR', name: 'Liberia', region: 'West Africa', currency: 'LRD' },
  { code: 'SL', name: 'Sierra Leone', region: 'West Africa', currency: 'SLL' },
  
  // Africa - East
  { code: 'KE', name: 'Kenya', region: 'East Africa', currency: 'KES' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa', currency: 'TZS' },
  { code: 'UG', name: 'Uganda', region: 'East Africa', currency: 'UGX' },
  { code: 'ET', name: 'Ethiopia', region: 'East Africa', currency: 'ETB' },
  { code: 'RW', name: 'Rwanda', region: 'East Africa', currency: 'RWF' },
  { code: 'MZ', name: 'Mozambique', region: 'East Africa', currency: 'MZN' },
  
  // Africa - Southern
  { code: 'ZA', name: 'South Africa', region: 'Southern Africa', currency: 'ZAR' },
  { code: 'BW', name: 'Botswana', region: 'Southern Africa', currency: 'BWP' },
  { code: 'ZW', name: 'Zimbabwe', region: 'Southern Africa', currency: 'ZWL' },
  { code: 'NA', name: 'Namibia', region: 'Southern Africa', currency: 'NAD' },
  { code: 'MW', name: 'Malawi', region: 'Southern Africa', currency: 'MWK' },
  { code: 'ZM', name: 'Zambia', region: 'Southern Africa', currency: 'ZMW' },
  
  // Africa - Central
  { code: 'CM', name: 'Cameroon', region: 'Central Africa', currency: 'XAF' },
  { code: 'CG', name: 'Congo', region: 'Central Africa', currency: 'XAF' },
  { code: 'GA', name: 'Gabon', region: 'Central Africa', currency: 'XAF' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', region: 'Europe', currency: 'GBP' },
  { code: 'DE', name: 'Germany', region: 'Europe', currency: 'EUR' },
  { code: 'FR', name: 'France', region: 'Europe', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', region: 'Europe', currency: 'EUR' },
  { code: 'IE', name: 'Ireland', region: 'Europe', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', region: 'Europe', currency: 'EUR' },
  { code: 'ES', name: 'Spain', region: 'Europe', currency: 'EUR' },
  { code: 'IT', name: 'Italy', region: 'Europe', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', region: 'Europe', currency: 'SEK' },
  { code: 'CH', name: 'Switzerland', region: 'Europe', currency: 'CHF' },
  { code: 'LU', name: 'Luxembourg', region: 'Europe', currency: 'EUR' },
  
  // North America
  { code: 'US', name: 'United States', region: 'North America', currency: 'USD' },
  { code: 'CA', name: 'Canada', region: 'North America', currency: 'CAD' },
  
  // Asia Pacific
  { code: 'SG', name: 'Singapore', region: 'Asia Pacific', currency: 'SGD' },
  { code: 'HK', name: 'Hong Kong', region: 'Asia Pacific', currency: 'HKD' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Asia Pacific', currency: 'AED' },
  { code: 'IN', name: 'India', region: 'Asia Pacific', currency: 'INR' },
  { code: 'AU', name: 'Australia', region: 'Asia Pacific', currency: 'AUD' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
  { code: 'NGN', name: 'Nigerian Naira (NGN)' },
  { code: 'KES', name: 'Kenyan Shilling (KES)' },
  { code: 'ZAR', name: 'South African Rand (ZAR)' },
  { code: 'GHS', name: 'Ghanaian Cedi (GHS)' },
  { code: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'SGD', name: 'Singapore Dollar (SGD)' },
  { code: 'AUD', name: 'Australian Dollar (AUD)' },
  { code: 'INR', name: 'Indian Rupee (INR)' },
  { code: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'CAD', name: 'Canadian Dollar (CAD)' },
  { code: 'SEK', name: 'Swedish Krona (SEK)' },
  { code: 'HKD', name: 'Hong Kong Dollar (HKD)' },
  { code: 'XOF', name: 'West African CFA franc (XOF)' },
  { code: 'XAF', name: 'Central African CFA franc (XAF)' },
  { code: 'BWP', name: 'Botswana Pula (BWP)' },
  { code: 'ZWL', name: 'Zimbabwe Dollar (ZWL)' },
  { code: 'NAD', name: 'Namibia Dollar (NAD)' },
  { code: 'MWK', name: 'Malawi Kwacha (MWK)' },
  { code: 'ZMW', name: 'Zambia Kwacha (ZMW)' },
  { code: 'TZS', name: 'Tanzania Shilling (TZS)' },
  { code: 'UGX', name: 'Uganda Shilling (UGX)' },
  { code: 'ETB', name: 'Ethiopian Birr (ETB)' },
  { code: 'RWF', name: 'Rwanda Franc (RWF)' },
  { code: 'MZN', name: 'Mozambique Metical (MZN)' },
  { code: 'LRD', name: 'Liberian Dollar (LRD)' },
  { code: 'SLL', name: 'Sierra Leone Leone (SLL)' },
];

const EnterpriseSettings = () => {
  const { user } = useAuth();
  const { currentOrganization, hasPermission, PERMISSIONS } = useEnterprise();
  const [activeTab, setActiveTab] = useState('organization');
  const [saved, setSaved] = useState(false);

  // Organization Settings State
  const [orgSettings, setOrgSettings] = useState({
    orgName: currentOrganization?.name || 'Atonix Capital',
    orgCountry: currentOrganization?.country || 'Nigeria',
    fiscalYearEnd: '12-31',
    taxFilingFrequency: 'annual',
    accountingStandard: 'IFRS',
    currency: 'USD'
  });

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    slack: { enabled: false, connected: false, workspace: '' },
    google: { enabled: false, connected: false, email: '' },
    microsoft: { enabled: false, connected: false, email: '' },
    api: { enabled: true, apiKey: '****-****-****-****', regenerate: false }
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    taxDeadlineAlerts: true,
    complianceReminders: true,
    teamNotifications: true,
    reportGeneration: true,
    securityAlerts: true,
    monthlyDigest: true
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    dataEncryption: true,
    auditLogging: true,
    sessionTimeout: '30',
    ipWhitelist: false,
    apiRateLimiting: true
  });

  const handleOrgSettingChange = (field, value) => {
    let updates = { [field]: value };
    
    // If country is changed, automatically set the currency
    if (field === 'orgCountry') {
      const selectedCountry = COUNTRIES_SERVED.find(c => c.name === value);
      if (selectedCountry) {
        updates.currency = selectedCountry.currency;
      }
    }
    
    setOrgSettings({ ...orgSettings, ...updates });
    setSaved(false);
  };

  const handleNotificationChange = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
    setSaved(false);
  };

  const handleSecurityChange = (field, value) => {
    setSecurity({ ...security, [field]: value });
    setSaved(false);
  };

  const handleIntegrationToggle = (service) => {
    setIntegrations({
      ...integrations,
      [service]: {
        ...integrations[service],
        enabled: !integrations[service].enabled
      }
    });
    setSaved(false);
  };

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRegenerateApiKey = () => {
    setIntegrations({
      ...integrations,
      api: {
        ...integrations.api,
        apiKey: 'sk-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9)
      }
    });
  };

  return (
    <div className="page-container enterprise-settings">
      <div className="settings-header">
        <h1 className="page-title">
          <FaCog /> Settings & Integrations
        </h1>
        <p className="subtitle">Manage organization settings, integrations, and security</p>
      </div>

      {/* Save Confirmation */}
      {saved && (
        <div className="save-confirmation">
          <FaCheck /> Settings saved successfully
        </div>
      )}

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <button
            className={`settings-tab ${activeTab === 'organization' ? 'active' : ''}`}
            onClick={() => setActiveTab('organization')}
          >
            <FaCog /> Organization
          </button>
          <button
            className={`settings-tab ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <FaLink /> Integrations
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt /> Security & Privacy
          </button>
        </aside>

        {/* Content Area */}
        <div className="settings-content">
          {/* ORGANIZATION SETTINGS */}
          {activeTab === 'organization' && (
            <div className="settings-section">
              <h2>Organization Settings</h2>
              
              <div className="settings-card">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Organization Name</label>
                  <input
                    type="text"
                    value={orgSettings.orgName}
                    onChange={(e) => handleOrgSettingChange('orgName', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Headquarters Country</label>
                    <select
                      value={orgSettings.orgCountry}
                      onChange={(e) => handleOrgSettingChange('orgCountry', e.target.value)}
                    >
                      <option value="">-- Select Country --</option>
                      {/* Africa - West */}
                      <optgroup label="🌍 Africa - West">
                        {COUNTRIES_SERVED.filter(c => c.region === 'West Africa').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* Africa - East */}
                      <optgroup label="🌍 Africa - East">
                        {COUNTRIES_SERVED.filter(c => c.region === 'East Africa').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* Africa - Southern */}
                      <optgroup label="🌍 Africa - Southern">
                        {COUNTRIES_SERVED.filter(c => c.region === 'Southern Africa').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* Africa - Central */}
                      <optgroup label="🌍 Africa - Central">
                        {COUNTRIES_SERVED.filter(c => c.region === 'Central Africa').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* Europe */}
                      <optgroup label="🇪🇺 Europe">
                        {COUNTRIES_SERVED.filter(c => c.region === 'Europe').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* North America */}
                      <optgroup label="🇺🇸 North America">
                        {COUNTRIES_SERVED.filter(c => c.region === 'North America').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                      {/* Asia Pacific */}
                      <optgroup label="🌏 Asia Pacific">
                        {COUNTRIES_SERVED.filter(c => c.region === 'Asia Pacific').map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Primary Currency</label>
                    <select
                      value={orgSettings.currency}
                      onChange={(e) => handleOrgSettingChange('currency', e.target.value)}
                    >
                      <option value="">-- Select Currency --</option>
                      {CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>{currency.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <h3>Accounting & Compliance</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fiscal Year End</label>
                    <input
                      type="text"
                      value={orgSettings.fiscalYearEnd}
                      placeholder="MM-DD"
                      onChange={(e) => handleOrgSettingChange('fiscalYearEnd', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax Filing Frequency</label>
                    <select
                      value={orgSettings.taxFilingFrequency}
                      onChange={(e) => handleOrgSettingChange('taxFilingFrequency', e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Accounting Standard</label>
                  <select
                    value={orgSettings.accountingStandard}
                    onChange={(e) => handleOrgSettingChange('accountingStandard', e.target.value)}
                  >
                    <option value="IFRS">IFRS (International)</option>
                    <option value="GAAP">GAAP (US)</option>
                    <option value="LOCAL">Local Standards</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handleSaveSettings}>
                <FaSave /> Save Organization Settings
              </button>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Integrations</h2>
              <p className="section-description">Connect third-party services to enhance your workflow</p>

              <div className="integrations-grid">
                {/* Slack Integration */}
                <div className="integration-card">
                  <div className="integration-header">
                    <FaSlack className="integration-icon slack" />
                    <h3>Slack</h3>
                  </div>
                  <p>Get tax alerts and compliance reminders in Slack</p>
                  <div className="integration-status">
                    {integrations.slack.connected ? (
                      <span className="status-connected">✓ Connected</span>
                    ) : (
                      <span className="status-disconnected">Not connected</span>
                    )}
                  </div>
                  <button
                    className={`btn-integration ${integrations.slack.enabled ? 'enabled' : 'disabled'}`}
                    onClick={() => handleIntegrationToggle('slack')}
                  >
                    {integrations.slack.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    {integrations.slack.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Google Integration */}
                <div className="integration-card">
                  <div className="integration-header">
                    <FaGoogle className="integration-icon google" />
                    <h3>Google Drive</h3>
                  </div>
                  <p>Auto-sync documents to your Google Drive</p>
                  <div className="integration-status">
                    {integrations.google.connected ? (
                      <span className="status-connected">✓ Connected</span>
                    ) : (
                      <span className="status-disconnected">Not connected</span>
                    )}
                  </div>
                  <button
                    className={`btn-integration ${integrations.google.enabled ? 'enabled' : 'disabled'}`}
                    onClick={() => handleIntegrationToggle('google')}
                  >
                    {integrations.google.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    {integrations.google.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Microsoft Integration */}
                <div className="integration-card">
                  <div className="integration-header">
                    <FaMicrosoft className="integration-icon microsoft" />
                    <h3>Microsoft 365</h3>
                  </div>
                  <p>Integrate with OneDrive and Teams</p>
                  <div className="integration-status">
                    {integrations.microsoft.connected ? (
                      <span className="status-connected">✓ Connected</span>
                    ) : (
                      <span className="status-disconnected">Not connected</span>
                    )}
                  </div>
                  <button
                    className={`btn-integration ${integrations.microsoft.enabled ? 'enabled' : 'disabled'}`}
                    onClick={() => handleIntegrationToggle('microsoft')}
                  >
                    {integrations.microsoft.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    {integrations.microsoft.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* API Configuration */}
              <div className="settings-card">
                <h3><FaPlug /> API Configuration</h3>
                <p>Use the API key to programmatically access your organization data</p>
                
                <div className="api-config">
                  <div className="api-key-section">
                    <label>API Key</label>
                    <div className="api-key-display">
                      <code>{integrations.api.apiKey}</code>
                      <button className="btn-small" onClick={handleRegenerateApiKey}>
                        Regenerate
                      </button>
                    </div>
                    <small>Keep your API key confidential. Anyone with this key can access your organization data.</small>
                  </div>

                  <div className="api-docs">
                    <h4>API Documentation</h4>
                    <p>Read our comprehensive API docs to get started:</p>
                    <a href="#" className="link">View API Documentation →</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">Choose how and when you want to be notified</p>

              <div className="settings-card">
                <h3>Alert Types</h3>
                
                <div className="notification-group">
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Tax Deadline Alerts</h4>
                      <p>Reminders for upcoming tax deadlines and filings</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.taxDeadlineAlerts ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('taxDeadlineAlerts')}
                    >
                      {notifications.taxDeadlineAlerts ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Compliance Reminders</h4>
                      <p>Status updates on compliance tasks and obligations</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.complianceReminders ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('complianceReminders')}
                    >
                      {notifications.complianceReminders ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Team Notifications</h4>
                      <p>Updates about team member activity and changes</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.teamNotifications ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('teamNotifications')}
                    >
                      {notifications.teamNotifications ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Report Generation</h4>
                      <p>Notifications when reports are ready for download</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.reportGeneration ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('reportGeneration')}
                    >
                      {notifications.reportGeneration ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Security Alerts</h4>
                      <p>Important security and access notifications</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.securityAlerts ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('securityAlerts')}
                    >
                      {notifications.securityAlerts ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Monthly Digest</h4>
                      <p>A summary of your organization's activity each month</p>
                    </div>
                    <button
                      className={`toggle-btn ${notifications.monthlyDigest ? 'on' : 'off'}`}
                      onClick={() => handleNotificationChange('monthlyDigest')}
                    >
                      {notifications.monthlyDigest ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>

                <button className="btn-primary" onClick={handleSaveSettings}>
                  <FaSave /> Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* SECURITY & PRIVACY */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security & Privacy</h2>
              <p className="section-description">Protect your organization's data and manage access</p>

              <div className="settings-card security-features">
                <h3><FaShieldAlt /> Security Features</h3>
                
                <div className="security-feature">
                  <div className="feature-info">
                    <h4><FaLock /> Two-Factor Authentication</h4>
                    <p>Require 2FA for all team members</p>
                  </div>
                  <button
                    className={`toggle-btn ${security.twoFactorAuth ? 'on' : 'off'}`}
                    onClick={() => handleSecurityChange('twoFactorAuth', !security.twoFactorAuth)}
                  >
                    {security.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="security-feature">
                  <div className="feature-info">
                    <h4><FaDatabase /> Data Encryption</h4>
                    <p>End-to-end encryption for all data at rest and in transit</p>
                  </div>
                  <button
                    className={`toggle-btn ${security.dataEncryption ? 'on' : 'off'}`}
                    onClick={() => handleSecurityChange('dataEncryption', !security.dataEncryption)}
                  >
                    {security.dataEncryption ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="security-feature">
                  <div className="feature-info">
                    <h4><FaServer /> Audit Logging</h4>
                    <p>Track all changes and access to organization data</p>
                  </div>
                  <button
                    className={`toggle-btn ${security.auditLogging ? 'on' : 'off'}`}
                    onClick={() => handleSecurityChange('auditLogging', !security.auditLogging)}
                  >
                    {security.auditLogging ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="security-feature">
                  <div className="feature-info">
                    <h4>Session Timeout</h4>
                    <p>Automatically log out inactive users</p>
                  </div>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>

                <div className="security-feature">
                  <div className="feature-info">
                    <h4>API Rate Limiting</h4>
                    <p>Protect against abuse with request rate limits</p>
                  </div>
                  <button
                    className={`toggle-btn ${security.apiRateLimiting ? 'on' : 'off'}`}
                    onClick={() => handleSecurityChange('apiRateLimiting', !security.apiRateLimiting)}
                  >
                    {security.apiRateLimiting ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>

              <div className="settings-card info-box">
                <FaInfo /> <strong>Privacy Notice:</strong> Your data is encrypted and never shared with third parties. We comply with GDPR, CCPA, and local data protection regulations.
              </div>

              <button className="btn-primary" onClick={handleSaveSettings}>
                <FaSave /> Save Security Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSettings;
