import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  ...props
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return React.cloneElement(icon, { className: 'btn-icon' });
    const IconComponent = icon;
    return <IconComponent className="btn-icon" />;
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
};

export default Button;
