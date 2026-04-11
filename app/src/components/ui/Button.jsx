import React from 'react';
import Icon from './Icon';

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
  const normalizedVariant = variant === 'critical' ? 'danger' : variant;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: ['btn-icon', icon.props.className].filter(Boolean).join(' '),
      });
    }

    return <Icon icon={icon} size="sm" className="btn-icon" />;
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${normalizedVariant} btn-${size} ${className}`}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
};

export default Button;
