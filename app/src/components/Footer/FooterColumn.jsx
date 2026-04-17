import React from 'react';
import { Link } from 'react-router-dom';

function FooterColumn({ columnKey, title, links, isOpen, onToggle }) {
  const contentId = `footer-column-${columnKey}`;

  const resolveInternalPath = (href) => {
    if (!href) {
      return null;
    }

    if (href.startsWith('/')) {
      return href;
    }

    try {
      const parsed = new URL(href);
      if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return null;
    }

    return null;
  };

  const handleInternalClick = (href) => {
    window.setTimeout(() => {
      if (href && href.includes('#')) {
        const hash = href.split('#')[1];
        const target = hash ? document.getElementById(hash) : null;

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

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
          {links.map((item) => {
            const internalPath = resolveInternalPath(item.to);
            const shouldUseRouterLink = Boolean(internalPath) && !item.external;

            return (
              <li key={item.label} className="footer-column__item">
                {shouldUseRouterLink ? (
                  <Link className="footer-link" to={internalPath} onClick={() => handleInternalClick(internalPath)}>
                    {item.label}
                  </Link>
                ) : (
                  <a className="footer-link" href={item.to} rel="noreferrer noopener">
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default FooterColumn;