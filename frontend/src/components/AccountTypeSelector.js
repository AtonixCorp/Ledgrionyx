import React, { useState } from 'react';

const AccountTypeSelector = ({ onSelect }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelect = (type) => {
    setSelectedType(type);
    onSelect(type);
  };

  return (
    <div className="account-type-selector-content">
      <h2 className="selector-title">Choose Your Account Type</h2>
      <p className="selector-subtitle">Select the experience that best fits your needs</p>

      <div className="account-type-grid">
        {/* Personal Account */}
        <div
          className={`account-type-card personal-card ${selectedType === 'personal' ? 'selected' : ''}`}
          onClick={() => handleSelect('personal')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleSelect('personal')}
        >
          <div className="card-header">
            <div className="icon-container personal-icon">

            </div>
            {selectedType === 'personal' && (
              <div className="selected-badge">

              </div>
            )}
          </div>

          <div className="card-content">
            <h3>Personal</h3>
            <p className="badge-label">For Individuals</p>
            <p className="card-description">Manage your personal finances and track taxes across multiple countries with ease.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Track income & expenses</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Monitor multiple countries</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Manage tax obligations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Personal insights & alerts</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Budget planning tools</span>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button className={`select-btn ${selectedType === 'personal' ? 'active' : ''}`}>
              {selectedType === 'personal' ? 'Selected' : 'Select Personal'}
            </button>
          </div>
        </div>

        {/* Enterprise Account */}
        <div
          className={`account-type-card enterprise-card ${selectedType === 'enterprise' ? 'selected' : ''}`}
          onClick={() => handleSelect('enterprise')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleSelect('enterprise')}
        >
          <div className="card-header">
            <div className="icon-container enterprise-icon">

            </div>
            {selectedType === 'enterprise' && (
              <div className="selected-badge">

              </div>
            )}
          </div>

          <div className="card-content">
            <h3>Enterprise</h3>
            <p className="badge-label">For Organizations</p>
            <p className="card-description">Manage multiple entities and teams with advanced compliance and reporting features.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Multi-entity management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Team collaboration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Role-based access control</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Compliance tracking & alerts</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <span>Advanced reporting & exports</span>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button className={`select-btn ${selectedType === 'enterprise' ? 'active' : ''}`}>
              {selectedType === 'enterprise' ? 'Selected' : 'Select Enterprise'}
            </button>
          </div>
        </div>
      </div>

      <div className="selector-note">
        <p> <strong>Pro Tip:</strong>You can upgrade or change your account type anytime in settings</p>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
