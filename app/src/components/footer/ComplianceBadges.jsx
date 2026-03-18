import React from 'react';

const badges = ['SOC 2', 'ISO 27001', 'GDPR'];

function ComplianceBadges() {
  return (
    <div className="footer-badges" aria-label="Compliance badges">
      {badges.map((badge) => (
        <span key={badge} className="footer-badge">
          {badge}
        </span>
      ))}
    </div>
  );
}

export default ComplianceBadges;