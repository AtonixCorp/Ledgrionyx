import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEnterprise } from '../../context/EnterpriseContext';

const BANKING_MODES = [
  { id: 'retail',   label: 'Retail',   short: 'R' },
  { id: 'business', label: 'Business', short: 'B' },
  { id: 'treasury', label: 'Treasury', short: 'T' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities } = useEnterprise();
  const firstEntity = (entities && entities.length > 0) ? entities[0] : null;
  const bookkeepingPath = firstEntity
    ? `/enterprise/entity/${firstEntity.id}/bookkeeping`
    : '/app/enterprise/entities';

  const [sidebarMinimized, setSidebarMinimized] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => setSidebarMinimized(!sidebarMinimized);

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  //  Navigation definitions

  const overviewNav = [
    { to: '/app/firm/enterprise-branches',    label: 'Dashboard' },
    { to: '/app/overview/notifications',  label: 'Notifications' },
    { to: '/app/overview/tasks',          label: 'Tasks' },
  ];

  const accountingNav = [
    { to: '/app/accounting/chart-of-accounts', label: 'Chart of Accounts' },
    { to: '/app/accounting/general-ledger', label: 'General Ledger' },
    { to: '/app/accounting/journal-entries', label: 'Journal Entries' },
    {
      label: 'Sub-Ledgers',
      submenu: [
        { to: '/app/subledgers/accounts-receivable', label: 'Accounts Receivable' },
        { to: '/app/subledgers/accounts-payable',    label: 'Accounts Payable' },
        { to: '/app/subledgers/cash-bank',           label: 'Cash & Bank' },
        { to: '/app/subledgers/fixed-assets',        label: 'Fixed Assets' },
        { to: '/app/subledgers/inventory',           label: 'Inventory' },
        { to: '/app/subledgers/payroll',             label: 'Payroll' },
        { to: '/app/subledgers/tax',                 label: 'Tax' },
      ]
    },
    { to: '/app/accounting/reconciliation', label: 'Reconciliation' },
  ];

  const billingNav = [
    { to: '/app/billing/invoices',        label: 'Invoices' },
    { to: '/app/billing/bills',           label: 'Bills' },
    { to: '/app/billing/customers',       label: 'Customers' },
    { to: '/app/billing/vendors',         label: 'Vendors' },
    { to: '/app/billing/payment-scheduling', label: 'Payment Scheduling' },
    { to: '/app/billing/collections',     label: 'Collections' },
  ];

  const reportingNav = [
    { to: '/app/reporting/statements',    label: 'Financial Statements' },
    { to: '/app/reporting/trial-balance', label: 'Trial Balance' },
    { to: '/app/reporting/analytics',     label: 'Reports & Analytics' },
  ];

  const budgetingNav = [
    { to: '/app/budgeting/budgets',       label: 'Budgets' },
    { to: '/app/budgeting/forecasts',     label: 'Forecasts' },
    { to: '/app/budgeting/variance-analysis', label: 'Variance Analysis' },
  ];

  const complianceNav = [
    { to: '/app/compliance/tax-center',   label: 'Tax Center' },
    { to: '/app/compliance/audit-trail',  label: 'Audit Trail' },
    { to: '/app/compliance/period-close', label: 'Period Close' },
  ];

  const documentsNav = [
    { to: '/app/documents/vault',         label: 'Document Vault' },
    { to: '/app/documents/receipts',      label: 'Receipts' },
  ];

  const clientsNav = [
    { to: '/app/clients/directory',       label: 'Clients' },
    { to: '/app/clients/portal',          label: 'Client Portal' },
  ];

  const automationNav = [
    { to: '/app/automation/rules',        label: 'Automation Rules' },
    { to: '/app/automation/recurring',    label: 'Recurring Entries' },
    { to: '/app/automation/ai-insights',  label: 'AI Insights' },
  ];

  const integrationsNav = [
    { to: '/app/integrations/api-keys',   label: 'API Keys' },
    { to: '/app/integrations/list',       label: 'Connected Apps' },
  ];

  const settingsNav = [
    { to: '/app/settings/firm',           label: 'Firm Settings' },
    { to: '/app/settings/entities',       label: 'Entity Management' },
    { to: '/app/settings/team',           label: 'Team & Permissions' },
    { to: '/app/settings/security',       label: 'Security' },
    { to: '/app/settings/branding',       label: 'Branding' },
    { to: '/app/settings/subscription',   label: 'Subscription' },
  ];

  const supportNav = [
    { to: '/app/support/help',            label: 'Help Center' },
    { to: '/app/support/tickets',         label: 'Support Tickets' },
  ];

  const bottomNav = [
    { to: '/app/enterprise/settings',     label: 'Settings' },
    { to: '/support',                     label: 'Support' },
  ];

  const toggleSubMenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderNavGroup = (items) =>
    items.map((item) => {
      if (item.submenu) {
        const isExpanded = expandedMenus[item.label];
        return (
          <li key={item.label}>
            <button
              className="nav-link submenu-toggle"
              onClick={() => toggleSubMenu(item.label)}
              title={sidebarMinimized ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarMinimized && (
                <>
                  <span className="nav-label">{item.label}</span>

                </>
              )}
            </button>
            {isExpanded && !sidebarMinimized && (
              <ul className="submenu">
                {item.submenu.map(subitem => (
                  <li key={subitem.to}>
                    <NavLink
                      to={subitem.to}
                      className={({ isActive }) => `nav-link submenu-item${isActive ? ' active' : ''}`}
                    >
                      <span className="nav-icon">{subitem.icon}</span>
                      <span className="nav-label">{subitem.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      }

      const { to, icon, label } = item;
      return (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            title={sidebarMinimized ? label : undefined}
          >
            <span className="nav-icon">{icon}</span>
            {!sidebarMinimized && <span className="nav-label">{label}</span>}
          </NavLink>
        </li>
      );
    });

  return (
    <div className="layout">
      {/*  SIDEBAR  */}
      <nav className={`sidebar${sidebarMinimized ? ' minimized' : ''}`} aria-label="Main navigation">

        {/* Navigation */}
        <ul className="nav-menu" role="list">
          {/* Overview */}
          {!sidebarMinimized && <li className="nav-section-label">Overview</li>}
          {renderNavGroup(overviewNav)}
          <li className="nav-divider" role="separator" />

          {/* Accounting Core */}
          {!sidebarMinimized && <li className="nav-section-label">Accounting</li>}
          {renderNavGroup(accountingNav)}
          <li className="nav-divider" role="separator" />

          {/* Billing & Payments */}
          {!sidebarMinimized && <li className="nav-section-label">Billing & Payments</li>}
          {renderNavGroup(billingNav)}
          <li className="nav-divider" role="separator" />

          {/* Financial Reporting */}
          {!sidebarMinimized && <li className="nav-section-label">Financial Reporting</li>}
          {renderNavGroup(reportingNav)}
          <li className="nav-divider" role="separator" />

          {/* Budgeting & Forecasting */}
          {!sidebarMinimized && <li className="nav-section-label">Budgeting & Forecasting</li>}
          {renderNavGroup(budgetingNav)}
          <li className="nav-divider" role="separator" />

          {/* Tax & Compliance */}
          {!sidebarMinimized && <li className="nav-section-label">Tax & Compliance</li>}
          {renderNavGroup(complianceNav)}
          <li className="nav-divider" role="separator" />

          {/* Document Management */}
          {!sidebarMinimized && <li className="nav-section-label">Document Management</li>}
          {renderNavGroup(documentsNav)}
          <li className="nav-divider" role="separator" />

          {/* Client Management */}
          {!sidebarMinimized && <li className="nav-section-label">Client Management</li>}
          {renderNavGroup(clientsNav)}
          <li className="nav-divider" role="separator" />

          {/* Automation */}
          {!sidebarMinimized && <li className="nav-section-label">Automation</li>}
          {renderNavGroup(automationNav)}
          <li className="nav-divider" role="separator" />

          {/* Integrations */}
          {!sidebarMinimized && <li className="nav-section-label">Integrations</li>}
          {renderNavGroup(integrationsNav)}
          <li className="nav-divider" role="separator" />

          {/* Settings */}
          {!sidebarMinimized && <li className="nav-section-label">Settings</li>}
          {renderNavGroup(settingsNav)}
          <li className="nav-divider" role="separator" />

          {/* Support */}
          {renderNavGroup(supportNav)}
        </ul>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">{userInitial}</div>
            {!sidebarMinimized && (
              <div className="user-meta">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email || ''}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Sign out">

            {!sidebarMinimized && <span>Sign Out</span>}
          </button>
        </div>
      </nav>

      {/*  MAIN CONTENT  */}
      <div className={`main-wrapper${sidebarMinimized ? ' sidebar-minimized' : ''}`}>
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">ATC Capital</h2>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">{userInitial}</div>
              <span className="topbar-name">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
