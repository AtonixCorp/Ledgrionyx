import React from 'react';
import { Link } from 'react-router-dom';

const StandaloneModuleShell = ({
  title,
  eyebrow = 'Standalone',
  backTo = '/app/console',
  backLabel = 'Back to Console',
  children,
}) => {
  return (
    <div className="standalone-module-shell">
      <div className="standalone-module-header">
        <div>
          <div className="standalone-module-eyebrow">{eyebrow}</div>
          <h1 className="standalone-module-title">{title}</h1>
        </div>
        <Link className="standalone-module-back" to={backTo}>
          {backLabel}
        </Link>
      </div>
      <div className="standalone-module-body">{children}</div>
    </div>
  );
};

export default StandaloneModuleShell;