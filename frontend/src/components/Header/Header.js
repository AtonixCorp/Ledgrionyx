import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage, LANGUAGE_LIST } from '../../context/LanguageContext';
import ATCLogo from '../branding/ATCLogo';
import './Header.css';

const COUNTRIES = [
  { code: 'US', name: 'United States',         flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom',         flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates',   flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore',              flag: '🇸🇬' },
  { code: 'AU', name: 'Australia',              flag: '🇦🇺' },
  { code: 'CA', name: 'Canada',                 flag: '🇨🇦' },
  { code: 'DE', name: 'Germany',                flag: '🇩🇪' },
  { code: 'FR', name: 'France',                 flag: '🇫🇷' },
  { code: 'JP', name: 'Japan',                  flag: '🇯🇵' },
  { code: 'IN', name: 'India',                  flag: '🇮🇳' },
];

const NAV_ITEMS = [
  { label: 'Home',       to: '/' },
  { label: 'Services',   to: '/product' },
  { label: 'Features',   to: '/features' },
  { label: 'Global Tax', to: '/global-tax' },
  { label: 'Pricing',    to: '/pricing' },
  { label: 'Resources',  to: '/help-center' },
  { label: 'Contact',    to: '/contact' },
  { label: 'About',      to: '/about' },
];

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryOpen,  setCountryOpen]  = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  return (
    <header className="atc-header">

      {/* ── Tier 1 — Utility Bar ─────────────────────────────────── */}
      <div className="atc-utility-bar">
        <div className="atc-utility-inner">

          {/* Left — Brand identifier */}
          <span className="atc-utility-brand">ATC Capital Global Platform</span>

          {/* Center — Country selector */}
          <div className="atc-utility-center">
            <button
              className="atc-country-btn"
              onClick={() => setCountryOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
            >
              <span className="atc-country-flag">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {countryOpen && (
              <div className="atc-country-dropdown" role="listbox">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    role="option"
                    aria-selected={c.code === selectedCountry.code}
                    className="atc-country-option"
                    onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Utility links */}
          <nav className="atc-utility-links" aria-label="Utility navigation">
            <Link to="/support">Support</Link>
            <Link to="/help-center">Security Center</Link>
            <Link to="/contact">Contact</Link>
            <div className="atc-lang-wrap">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="atc-lang-select"
                aria-label="Select language"
              >
                {LANGUAGE_LIST.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <Link to="/login" className="atc-signin">Sign In</Link>
          </nav>
        </div>
      </div>

      {/* ── Tier 2 — Primary Navigation Bar ─────────────────────── */}
      <div className="atc-primary-bar">
        <div className="atc-primary-inner">

          {/* Logo */}
          <Link to="/" className="atc-logo-link" aria-label="ATC Capital Home">
            <ATCLogo size="medium" withText />
          </Link>

          {/* Navigation */}
          <nav className="atc-primary-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'atc-nav-link' + (isActive ? ' atc-nav-link--active' : '')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="atc-primary-actions">
            <Link to="/v1/docs" className="atc-cta-secondary">API Portal</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="atc-hamburger"
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
        <nav className="atc-mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="atc-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="atc-mobile-actions">
            <Link
              to="/register"
              className="atc-cta-primary"
              onClick={() => setMobileOpen(false)}
            >
              Open Account
            </Link>
            <Link
              to="/login"
              className="atc-mobile-signin"
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

