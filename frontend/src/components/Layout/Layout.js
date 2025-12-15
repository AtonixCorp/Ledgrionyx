import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartPie, FaMoneyBillWave, FaHandHoldingUsd, FaChartLine, FaChartBar, FaBrain, FaDna, FaShieldAlt, FaTrophy, FaCalculator, FaSignOutAlt, FaMoneyBill } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaChartPie /></span>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaMoneyBillWave /></span>
              Expenses
            </NavLink>
          </li>
          <li>
            <NavLink to="/income" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaHandHoldingUsd /></span>
              Income
            </NavLink>
          </li>
          <li>
            <NavLink to="/budget" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaChartLine /></span>
              Budget
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaChartBar /></span>
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-insights" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaBrain /></span>
              AI Insights
            </NavLink>
          </li>
          <li>
            <NavLink to="/financial-dna" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaDna /></span>
              Financial DNA
            </NavLink>
          </li>
          <li>
            <NavLink to="/security-vaults" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaShieldAlt /></span>
              Security & Vaults
            </NavLink>
          </li>
          <li>
            <NavLink to="/achievements" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaTrophy /></span>
              Achievements
            </NavLink>
          </li>
          <li>
            <NavLink to="/tax-calculator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon"><FaCalculator /></span>
              Tax Calculator
            </NavLink>
          </li>
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
