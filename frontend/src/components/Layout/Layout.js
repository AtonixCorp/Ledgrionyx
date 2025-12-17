import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaMoneyBillWave, FaHandHoldingUsd, FaChartLine, FaChartBar, FaBrain, FaDna, FaShieldAlt, FaTrophy, FaCalculator, FaSignOutAlt, FaMoneyBill, FaBuilding, FaCheckCircle, FaFileExport, FaUsers, FaCog, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isEnterprise = user?.account_type === 'enterprise';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title"><FaMoneyBill /> Atonix Capital</h1>
        </div>
        
        <ul className="nav-menu">
          {/* PERSONAL NAVIGATION */}
          {!isEnterprise && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaHome /></span>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/income" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaHandHoldingUsd /></span>
                  My Income
                </NavLink>
              </li>
              <li>
                <NavLink to="/tax-calculator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaCalculator /></span>
                  Tax & Returns
                </NavLink>
              </li>
              <li>
                <NavLink to="/budget" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaChartLine /></span>
                  Cashflow & Budgets
                </NavLink>
              </li>
              <li>
                <NavLink to="/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaMoneyBillWave /></span>
                  Assets & Liabilities
                </NavLink>
              </li>
              <li>
                <NavLink to="/ai-insights" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaBrain /></span>
                  Insights & Alerts
                </NavLink>
              </li>
              <li className="nav-divider"></li>
              <li>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaCog /></span>
                  Settings
                </NavLink>
              </li>
            </>
          )}

          {/* ENTERPRISE NAVIGATION */}
          {isEnterprise && (
            <>
              <li>
                <NavLink to="/app/enterprise/org-overview" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaChartBar /></span>
                  Org Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/entities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaBuilding /></span>
                  Entities & Countries
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/cashflow" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaChartLine /></span>
                  Cashflow & Treasury
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/tax-compliance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaCheckCircle /></span>
                  Tax & Compliance
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/risk-exposure" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaExclamationTriangle /></span>
                  Risk & Exposure
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaFileExport /></span>
                  Reports & Exports
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/enterprise/team" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaUsers /></span>
                  Team & Permissions
                </NavLink>
              </li>
              <li className="nav-divider"></li>
              <li>
                <NavLink to="/app/enterprise/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon"><FaCog /></span>
                  Settings & Integrations
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.avatar || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
              {user?.phone && (
                <div className="user-phone">{user.phone}</div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon"><FaSignOutAlt /></span>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
