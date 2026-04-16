import React from 'react';
import LedgrionyxLogo from '../branding/LedgrionyxLogo';

export const LogoMark = ({ size = 32, variant = 'white' }) => {
  return <LedgrionyxLogo variant={variant} size={size} withText={false} />;
};

export default LogoMark;
