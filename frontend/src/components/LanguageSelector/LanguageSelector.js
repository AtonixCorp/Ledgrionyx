import React from 'react';
import { useLanguage, LANGUAGE_LIST } from '../../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // Optional: Save to localStorage for persistence
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  return (
    <div className="language-selector">
      <select
        id="language-dropdown"
        value={language}
        onChange={handleLanguageChange}
        className="language-dropdown"
        aria-label="Choose your preferred language"
      >
        {LANGUAGE_LIST.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
