import React from 'react';
import './ATCLogo.css';


const SIZE_MAP = {
  small: 24,
  medium: 32,
  large: 40,
};


function ATCLogo({ variant = 'full', withText = true, size = 'medium', text = 'Ledgrionyx', className = '' }) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.medium;
  const classes = ['atc-logo-lockup', `atc-logo--${variant}`, `atc-logo--${size}`, className].filter(Boolean).join(' ');
  const secondaryText = text === 'Ledgrionyx' ? '' : text.replace('Ledgrionyx', '').trim();

  return (
    <span className={classes}>
      <svg
        className="atc-logo-mark"
        width={dimension}
        height={dimension}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" className="atc-logo-mark__ring" />
        <path className="atc-logo-mark__orbit" d="M14 36.5C20.2 46 31 51.2 42.3 49.3C48.5 48.2 54 44.7 58 39.4" />
        <path className="atc-logo-mark__beam" d="M20 42L31.8 16L44 42" />
        <path className="atc-logo-mark__crossbar" d="M25.4 31.5H38.4" />
      </svg>
      {withText ? (
        <span className="atc-logo-wordmark">
          <span className="atc-logo-wordmark__primary">Ledgrionyx</span>
          {secondaryText ? <span className="atc-logo-wordmark__secondary">{secondaryText}</span> : null}
        </span>
      ) : null}
    </span>
  );
}


export default ATCLogo;