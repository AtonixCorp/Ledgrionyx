import React from 'react';
import LedgrionyxLogo from '../branding/LedgrionyxLogo';

export const Logo = ({ height = 32 }) => {
  return <LedgrionyxLogo variant="full" size={height} withText />;
};

export default Logo;
