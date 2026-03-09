import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  FaChartBar, FaUniversity, FaExchangeAlt, FaCreditCard, FaArrowRight,
  FaTools, FaLandmark, FaCog, FaLifeRing, FaSignOutAlt, FaBars, FaTimes,
  FaChevronDown, FaUsers, FaFileAlt, FaShieldAlt, FaSitemap, FaBuilding,
  FaChartLine, FaCheckCircle, FaUsersCog, FaPlug, FaStore, FaPalette,
  FaExclamationTriangle, FaFileExport, FaTh
} from 'react-icons/fa';
import './Layout.css';

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

  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [bankingMode, setBankingMode] = useState('business');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => setSidebarMinimized(!sidebarMinimized);

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  // ── Navigation definitions per banking mode ──────────────────────────────
  const coreNav = [
    { to: '/app/enterprise/org-overview', icon: <FaChartBar />,     label: 'Dashboard' },
    { to: '/app/enterprise/entities',     icon: <FaUniversity />,   label: 'Accounts' },
    { to: '/app/enterprise/cashflow',     icon: <FaExchangeAlt />,  label: 'Payments' },
    { to: '/app/enterprise/cards',        icon: <FaCreditCard />,   label: 'Cards' },
    { to: '/app/enterprise/transfers',    icon: <FaArrowRight />,   label: 'Transfers' },
  ];

  const businessNav = [
    { to: '/app/firm/dashboard',          icon: <FaUsersCog />,     label: 'Firm Dashboard' },
    { to: '/app/enterprise/tax-compliance', icon: <FaCheckCircle />, label: 'Tax & Compliance' },
    { to: '/app/enterprise/risk-exposure', icon: <FaExclamationTriangle />, label: 'Risk & Exposure' },
    { to: '/app/enterprise/reports',      icon: <FaFileExport />,   label: 'Reports & Exports' },
    { to: '/app/enterprise/team',         icon: <FaUsers />,        label: 'Team & Permissions' },
  ];

  const treasuryNav = [
    { to: '/app/enterprise/cashflow',     icon: <FaLandmark />,     label: 'Treasury' },
    { to: '/app/firm/integrations',       icon: <FaPlug />,         label: 'API Integrations' },
    { to: '/app/firm/enterprise-branches', icon: <FaSitemap />,     label: 'Enterprise Branches' },
    { to: '/app/firm/marketplace',        icon: <FaStore />,        label: 'Marketplace' },
    { to: '/app/firm/white-label',        icon: <FaPalette />,      label: 'White-Label' },
  ];

  const bottomNav = [
    { to: '/app/enterprise/settings',     icon: <FaCog />,          label: 'Settings' },
    { to: '/support',                     icon: <FaLifeRing />,     label: 'Support' },
  ];

  const renderNavGroup = (items) =>
    items.map(({ to, icon, label }) => (
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
    ));

  return (
    <div className="layout">
      {/* ── SIDEBAR ── */}
      <nav className={`sidebar${sidebarMinimized ? ' minimized' : ''}`} aria-label="Main navigation">

        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            {!sidebarMinimized && (
              <div className="brand-wordmark">
                <span className="brand-atc">ATC</span>
                <span className="brand-capital">Capital</span>
              </div>
            )}
            {sidebarMinimized && <span className="brand-monogram">ATC</span>}
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarMinimized ? <FaBars /> : <FaTimes />}
            </button>
          </div>
        </div>

        {/* Banking Mode Switcher */}
        <div className="mode-switcher">
          {sidebarMinimized ? (
            <div className="mode-switcher-mini">
              {BANKING_MODES.map((m) => (
                <button
                  key={m.id}
                  className={`mode-btn-mini${bankingMode === m.id ? ' active' : ''}`}
                  onClick={() => setBankingMode(m.id)}
                  title={m.label}
                >
                  {m.short}
                </button>
              ))}
            </div>
          ) : (
            <div className="mode-switcher-row">
              {BANKING_MODES.map((m) => (
                <button
                  key={m.id}
                  className={`mode-btn${bankingMode === m.id ? ' active' : ''}`}
                  onClick={() => setBankingMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <ul className="nav-menu" role="list">
          {/* Core — always visible */}
          {!sidebarMinimized && <li className="nav-section-label">Core</li>}
          {renderNavGroup(coreNav)}

          <li className="nav-divider" role="separator" />

          {/* Business Tools — visible in business + treasury modes */}
          {bankingMode !== 'retail' && (
            <>
              {!sidebarMinimized && <li className="nav-section-label">Business Tools</li>}
              {renderNavGroup(businessNav)}
              <li className="nav-divider" role="separator" />
            </>
          )}

          {/* Treasury — visible in treasury mode */}
          {bankingMode === 'treasury' && (
            <>
              {!sidebarMinimized && <li className="nav-section-label">Treasury</li>}
              {renderNavGroup(treasuryNav)}
              <li className="nav-divider" role="separator" />
            </>
          )}

          {renderNavGroup(bottomNav)}
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
            <FaSignOutAlt className="logout-icon" />
            {!sidebarMinimized && <span>Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className={`main-wrapper${sidebarMinimized ? ' sidebar-minimized' : ''}`}>
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-mode-badge">
              {BANKING_MODES.find(m => m.id === bankingMode)?.label} Banking
            </span>
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
