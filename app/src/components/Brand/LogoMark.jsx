import React from 'react';
import iconSrc from '../../assets/icon-ledgrionyx-mark.svg';

export const LogoMark = ({ size = 32 }) => {
  return (
    <img
      src={iconSrc}
      alt="Ledgrionyx"
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
};

export default LogoMark;
