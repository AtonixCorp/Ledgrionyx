import React from 'react';
import { PageHeader, Card } from '../../../components/ui';

const PageLayout = ({
  title,
  subtitle,
  actions,
  children,
  sidebar,
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="page-layout">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
      />

      {tabs && (
        <div className="page-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="page-content">
        {sidebar && <aside className="page-sidebar">{sidebar}</aside>}
        <main className="page-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
