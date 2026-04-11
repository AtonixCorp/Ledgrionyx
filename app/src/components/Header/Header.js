import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../Brand/Logo';
import { Icon } from '../ui';
import { FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Home',       to: '/' },
  { label: 'Services',   to: '/product' },
  { label: 'Deployment', to: '/deployment' },
  { label: 'Features',   to: '/features' },
  { label: 'Global Tax', to: '/global-tax' },
  { label: 'Pricing',    to: '/pricing' },
  { label: 'Resources',  to: '/help-center' },
  { label: 'Security Center', to: '/security-center' },
  { label: 'About',      to: '/about' },
  { label: 'Contact',    to: '/contact' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="ly-header">

      <div className="ly-utility-bar">
        <div className="ly-utility-inner">
          <Link to="/" className="ly-logo-link" aria-label="Ledgrionyx Home">
            <Logo height={32} />
          </Link>

          <nav className="ly-utility-links" aria-label="Utility navigation">
            <Link to="/login">Login</Link>
            <Link to="/register" className="ly-cta-primary">Open Account</Link>
            <Link to="/support">Support</Link>
          </nav>

          <button
            className="ly-hamburger"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <Icon icon={mobileOpen ? FiX : FiMenu} size="md" />
          </button>
        </div>
      </div>

      <div className="ly-primary-bar">
        <div className="ly-primary-inner">
          <nav className="ly-primary-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'ly-nav-link' + (isActive ? ' ly-nav-link--active' : '')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {mobileOpen && (
        <nav className="ly-mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="ly-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="ly-mobile-actions">
            <Link
              to="/register"
              className="ly-cta-primary"
              onClick={() => setMobileOpen(false)}
            >
              Open Account
            </Link>
            <Link to="/login" className="ly-mobile-signin" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

