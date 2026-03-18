import React from 'react';
import { Link } from 'react-router-dom';

function FooterColumn({ columnKey, title, links, isOpen, onToggle }) {
  const contentId = `footer-column-${columnKey}`;

  const handleInternalClick = () => {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  };

  return (
    <section className={`footer-column${isOpen ? ' is-open' : ''}`} aria-labelledby={`${contentId}-title`}>
      <button
        type="button"
        className="footer-column__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span id={`${contentId}-title`} className="footer-column__title">{title}</span>
        <span className="footer-column__chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div id={contentId} className="footer-column__content">
        <ul className="footer-column__list">
          {links.map((item) => (
            <li key={item.label} className="footer-column__item">
              {item.external ? (
                <a className="footer-link" href={item.to} target="_blank" rel="noreferrer noopener">
                  {item.label}
                </a>
              ) : (
                <Link className="footer-link" to={item.to.split('#')[0] || item.to} onClick={handleInternalClick}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FooterColumn;