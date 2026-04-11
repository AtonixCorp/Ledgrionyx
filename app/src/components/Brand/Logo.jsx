import React from 'react';
import logoSrc from '../../assets/logo-ledgrionyx.svg';

export const Logo = ({ height = 32 }) => {
  return (
    <img
      src={logoSrc}
      alt="Ledgrionyx Global Platform"
      style={{ display: 'block', height, width: 'auto' }}
    />
  );
};

export default Logo;
