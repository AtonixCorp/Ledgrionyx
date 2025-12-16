import React from 'react';
import { Link } from 'react-router-dom';
import AtonixLogo from '../Logo/AtonixLogo';
import './Header.css';

const Header = () => {
  return (
    <nav className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo-wrapper">
          <AtonixLogo size="extra-small" />
          <span className="logo-text">Atonix Capital</span>
        </Link>
        <div className="header-nav-links">
          <Link to="/login" className="btn-outline">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
