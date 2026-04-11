import React from 'react';

const SIZE_CLASS_MAP = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
};

const Icon = ({ icon: IconComponent, size = 'md', className = '', title, tone = 'light', ...props }) => {
  if (!IconComponent) {
    return null;
  }

  const sizeClass = SIZE_CLASS_MAP[size] || size;
  const toneClass = tone === 'dark' ? 'icon-on-dark' : tone === 'active' ? 'icon-active' : null;
  const classes = ['icon', sizeClass, toneClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden={title ? undefined : 'true'} aria-label={title} title={title} {...props}>
      <IconComponent />
    </span>
  );
};

export default Icon;