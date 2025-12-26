import React, { createContext, useContext, useState, useMemo } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large', 'extra-large'

  const fontSizeClass = {
    small: 'font-size-small',
    normal: 'font-size-normal',
    large: 'font-size-large',
    'extra-large': 'font-size-extra-large',
  }[fontSize] || 'font-size-normal';

  const fontSizeValue = {
    small: '12px',
    normal: '16px',
    large: '18px',
    'extra-large': '20px',
  }[fontSize] || '16px';

  const value = useMemo(() => {
    return {
      fontSize,
      setFontSize,
      fontSizeClass,
      fontSizeValue,
    };
  }, [fontSize]);

  return (
    <AccessibilityContext.Provider value={value}>
      <div style={{ fontSize: fontSizeValue }}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
