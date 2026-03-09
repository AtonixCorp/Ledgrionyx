import React from 'react';

const Input = ({ label, error, required, ...props }) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input className={`input ${error ? 'error' : ''}`} {...props} />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
