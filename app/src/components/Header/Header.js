import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { useLanguage, LANGUAGE_LIST } from '../../context/LanguageContext';
import { Logo } from '../Brand/Logo';
import { Icon } from '../ui';
import { countryDropdownOptions } from '../../utils/countryDropdowns';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Home',       to: '/' },
  { label: 'Services',   to: '/product' },
  { label: 'Deployment', to: '/deployment' },
  { label: 'Features',   to: '/features' },
  { label: 'Global Tax', to: '/global-tax' },
  { label: 'Pricing',    to: '/pricing' },
  { label: 'Resources',  to: '/help-center' },
  { label: 'About',      to: '/about' },
];

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const defaultCountry = countryDropdownOptions.find((country) => country.code === 'US') || countryDropdownOptions[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [countryOpen,  setCountryOpen]  = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  return (
    <header className="ly-header">

      {/* ── Tier 1 — Utility Bar ─────────────────────────────────── */}
      <div className="ly-utility-bar">
        <div className="ly-utility-inner">

          {/* Left — Brand identifier */}
          <span className="ly-utility-brand">Ledgrionyx Global Platform</span>

          {/* Center — Country selector */}
          <div className="ly-utility-center">
            <button
              className="ly-country-btn"
              onClick={() => setCountryOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
            >
              <span>{selectedCountry.name}</span>
              <Icon icon={FiChevronDown} size="sm" />
            </button>

            {countryOpen && (
              <div className="ly-country-dropdown" role="listbox">
                {countryDropdownOptions.map(c => (
                  <button
                    key={c.code}
                    role="option"
                    aria-selected={c.code === selectedCountry.code}
                    className="ly-country-option"
                    onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Utility links */}
          <nav className="ly-utility-links" aria-label="Utility navigation">
            <Link to="/support">Support</Link>
            <Link to="/help-center">Security Center</Link>
            <Link to="/contact">Contact</Link>
            <div className="ly-lang-wrap">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="ly-lang-select"
                aria-label="Select language"
              >
                {LANGUAGE_LIST.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <Link to="/login" className="ly-signin">Sign In</Link>
          </nav>
        </div>
      </div>

      {/* ── Tier 2 — Primary Navigation Bar ─────────────────────── */}
      <div className="ly-primary-bar">
        <div className="ly-primary-inner">

          {/* Logo */}
          <Link to="/" className="ly-logo-link" aria-label="Ledgrionyx Home">
            <Logo height={32} />
          </Link>

          {/* Navigation */}
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

          {/* CTA buttons */}
          <div className="ly-primary-actions">
            <Link to="/register" className="ly-cta-primary">Open Account</Link>
            <Link to="/product" className="ly-cta-secondary">Explore Products</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="ly-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Mobile navigation drawer ─────────────────────────────── */}
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
            <Link
              to="/login"
              className="ly-mobile-signin"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

