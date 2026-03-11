import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilityControls = () => {
  const { fontSize, setFontSize } = useAccessibility();

  return (
    <div className="accessibility-controls" role="region" aria-label="Accessibility controls">
      <button
        type="button"
        className="a11y-btn"
        onClick={() => setFontSize('small')}
        title="Decrease font size (Small)"
        aria-label="Small font size"
        aria-pressed={fontSize === 'small'}
      >
        S
      </button>
      <button
        type="button"
        className="a11y-btn"
        onClick={() => setFontSize('normal')}
        title="Normal font size"
        aria-label="Normal font size"
        aria-pressed={fontSize === 'normal'}
      >
        M
      </button>
      <button
        type="button"
        className="a11y-btn"
        onClick={() => setFontSize('large')}
        title="Increase font size (Large)"
        aria-label="Large font size"
        aria-pressed={fontSize === 'large'}
      >
        L
      </button>
      <button
        type="button"
        className="a11y-btn"
        onClick={() => setFontSize('extra-large')}
        title="Increase font size (Extra Large)"
        aria-label="Extra large font size"
        aria-pressed={fontSize === 'extra-large'}
      >
        XL
      </button>
    </div>
  );
};

export default AccessibilityControls;
