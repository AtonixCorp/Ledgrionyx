import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import '../Layout/Layout.css';
import '../../styles/EntityPages.css';

const EntityLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { entityId } = useParams();
  const { entities } = useEnterprise();

  const entity = (entities || []).find(e => e.id?.toString() === entityId?.toString());
  const entityName = entity?.name || 'Entity';

  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleSidebar = () => setSidebarMinimized(v => !v);
  const toggleMenu = (label) => setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const id = entityId;

  const navSections = [
    {
      label: 'Entity',
      items: [
        { to: `/app/enterprise/entities/${id}/dashboard`, label: 'Dashboard' },
        {
          label: 'Bookkeeping',
          submenu: [
            { to: `/enterprise/entity/${id}/bookkeeping`, label: 'Overview' },
            { to: `/enterprise/entity/${id}/bookkeeping/transactions`, label: 'Transactions' },
            { to: `/enterprise/entity/${id}/bookkeeping/categories`, label: 'Categories' },
            { to: `/enterprise/entity/${id}/bookkeeping/accounts`, label: 'Accounts' },
            { to: `/enterprise/entity/${id}/bookkeeping/reports`, label: 'Reports' },
            { to: `/enterprise/entity/${id}/bookkeeping/staff-hr`, label: 'Staff & HR' },
          ],
        },
        { to: `/enterprise/entity/${id}/expenses`, label: 'Expenses' },
        { to: `/enterprise/entity/${id}/income`, label: 'Income' },
        { to: `/enterprise/entity/${id}/budgets`, label: 'Budgets' },
        { to: `/enterprise/entity/${id}/cashflow-treasury`, label: 'Cashflow & Treasury' },
      ],
    },
    {
      label: 'Accounting',
      items: [
        { to: `/enterprise/entity/${id}/chart-of-accounts`, label: 'Chart of Accounts' },
        { to: `/enterprise/entity/${id}/general-ledger`, label: 'General Ledger' },
        { to: `/enterprise/entity/${id}/journal-entries`, label: 'Journal Entries' },
        {
          label: 'Sub-Ledgers',
          submenu: [
            { to: `/enterprise/entity/${id}/accounts-receivable`, label: 'Accounts Receivable' },
            { to: `/enterprise/entity/${id}/accounts-payable`, label: 'Accounts Payable' },
            { to: `/enterprise/entity/${id}/bank-reconciliation`, label: 'Bank Reconciliation' },
            { to: `/enterprise/entity/${id}/inventory`, label: 'Inventory' },
            { to: `/enterprise/entity/${id}/revenue-recognition`, label: 'Revenue Recognition' },
            { to: `/enterprise/entity/${id}/fx-accounting`, label: 'FX Accounting' },
          ],
        },
        { to: `/enterprise/entity/${id}/period-close`, label: 'Period Close' },
        { to: `/enterprise/entity/${id}/notifications`, label: 'Notifications' },
      ],
    },
  ];

  const renderItem = (item) => {
    if (item.submenu) {
      const isOpen = expandedMenus[item.label];
      return (
        <li key={item.label}>
          <button
            className="nav-link submenu-toggle"
            onClick={() => toggleMenu(item.label)}
            title={sidebarMinimized ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!sidebarMinimized && (
              <>
                <span className="nav-label">{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10 }}>{isOpen ? '▾' : '▸'}</span>
              </>
            )}
          </button>
          {isOpen && !sidebarMinimized && (
            <ul className="submenu">
              {item.submenu.map(sub => (
                <li key={sub.to}>
                  <NavLink
                    to={sub.to}
                    end
                    className={({ isActive }) => `nav-link submenu-item${isActive ? ' active' : ''}`}
                  >
                    <span className="nav-label">{sub.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }
    return (
      <li key={item.to}>
        <NavLink
          to={item.to}
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          title={sidebarMinimized ? item.label : undefined}
        >
          <span className="nav-icon">{item.icon}</span>
          {!sidebarMinimized && <span className="nav-label">{item.label}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <nav className={`sidebar${sidebarMinimized ? ' minimized' : ''}`} aria-label="Entity navigation">

        {/* Entity Header */}
        <div className="sidebar-header" style={{ background: '#0B0C10' }}>
          <div className="sidebar-brand">
            <span className="sidebar-brand-dot" style={{ background: '#00B5E2' }} />
            {!sidebarMinimized && (
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entityName}
              </span>
            )}
          </div>
        </div>

        {/* Back link */}
        <div style={{ padding: sidebarMinimized ? '10px 0' : '10px 16px', borderBottom: '1px solid #E5E7EB' }}>
          <button
            onClick={() => navigate('/app/enterprise/entities')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', fontSize: 12, fontWeight: 600,
              justifyContent: sidebarMinimized ? 'center' : 'flex-start',
              padding: '6px 8px', borderRadius: 6,
            }}
            title="Back to ATC Capital"
            onMouseOver={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <span>←</span>
            {!sidebarMinimized && <span>Back to ATC Capital</span>}
          </button>
        </div>

        {/* Nav */}
        <ul className="nav-menu" role="list">
          {navSections.map(section => (
            <React.Fragment key={section.label}>
              {!sidebarMinimized && (
                <li className="nav-section-label">
                  <span>{section.label}</span>
                </li>
              )}
              {section.items.map(renderItem)}
              <li className="nav-divider" role="separator" />
            </React.Fragment>
          ))}
        </ul>

        {/* Sidebar collapse button */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={toggleSidebar}
            title={sidebarMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarMinimized ? '→' : '←'}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={`main-wrapper${sidebarMinimized ? ' sidebar-minimized' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title" style={{ fontSize: 16 }}>{entityName}</h2>
            {entity?.country && (
              <span className="topbar-org-context">{entity.country} · {entity.entity_type?.replace(/_/g, ' ')}</span>
            )}
          </div>
          <div className="topbar-right">
            <div className="profile-menu" ref={profileRef}>
              <button
                className="profile-avatar-btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Open profile menu"
                title="Profile"
              >
                {userInitial}
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-name">{user?.name || user?.email}</span>
                    <span className="profile-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={() => { navigate('/app/settings/firm'); setProfileOpen(false); }}>
                    Settings
                  </button>
                  <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EntityLayout;
