import React from 'react';
import { Link } from 'react-router-dom';
import AtonixLogo from '../Logo/AtonixLogo';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import './Header.css';

const Header = () => {
  const { t } = useLanguage();

  return (
    <nav className="app-header" role="navigation" aria-label="Main header">
      <div className="header-content">
        <a href="/" className="header-logo-wrapper" aria-label="Atonix Capital Home">
          <AtonixLogo size="extra-small" />
          <span className="logo-text">{t('appName')}</span>
        </a>
        <div className="header-nav-links">
          <LanguageSelector />
          <a href="/login" className="btn-outline" role="link">{t('auth.login')}</a>
          <a href="/register" className="btn-primary" role="link">{t('auth.getStarted')}</a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
