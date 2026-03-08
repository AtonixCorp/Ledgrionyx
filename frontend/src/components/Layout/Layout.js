import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useEnterprise } from '../../context/EnterpriseContext';
import { FaMoneyBill, FaBuilding, FaCheckCircle, FaFileExport, FaUsers, FaCog, FaExclamationTriangle, FaChartLine, FaChartBar, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities } = useEnterprise();
  const firstEntity = (entities && entities.length > 0) ? entities[0] : null;
  const bookkeepingPath = firstEntity ? `/enterprise/entity/${firstEntity.id}/bookkeeping` : '/app/enterprise/entities';
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <div className="layout">
      <nav className={`sidebar ${sidebarMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <h1 className="app-title"><FaMoneyBill /> {!sidebarMinimized && t('appName')}</h1>
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar} 
              title={sidebarMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
              aria-label={sidebarMinimized ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            >
              {sidebarMinimized ? <FaBars /> : <FaTimes />}
            </button>
          </div>
          {!sidebarMinimized && (
            <div className="sidebar-controls">
              <LanguageSelector />
            </div>
          )}
        </div>
        
        <ul className="nav-menu" role="navigation" aria-label="Main navigation">
          {/* ENTERPRISE NAVIGATION */}
          <li>
            <NavLink to="/app/enterprise/org-overview" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaChartBar /></span>
              {!sidebarMinimized && t('nav.orgOverview')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/entities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaBuilding /></span>
              {!sidebarMinimized && t('nav.entitiesCountries')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/cashflow" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaChartLine /></span>
              {!sidebarMinimized && t('nav.cashflowTreasury')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/tax-compliance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaCheckCircle /></span>
              {!sidebarMinimized && t('nav.taxCompliance')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/risk-exposure" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaExclamationTriangle /></span>
              {!sidebarMinimized && t('nav.riskExposure')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaFileExport /></span>
              {!sidebarMinimized && t('nav.reportsExports')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/enterprise/team" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaUsers /></span>
              {!sidebarMinimized && t('nav.teamPermissions')}
            </NavLink>
          </li>
          <li className="nav-divider"></li>
          <li>
            <NavLink to="/app/enterprise/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaCog /></span>
              {!sidebarMinimized && t('nav.enterpriseSettings')}
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.avatar || 'U'}</div>
            {!sidebarMinimized && (
              <div className="user-details">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email || ''}</div>
                {user?.phone && (
                  <div className="user-phone">{user.phone}</div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon"><FaSignOutAlt /></span>
            {!sidebarMinimized && t('nav.logout')}
          </button>
        </div>
      </nav>

      <main className={`main-content ${sidebarMinimized ? 'sidebar-minimized' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
