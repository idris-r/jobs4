import React from 'react';
import './CommonComponents.css';

export const SectionHeader = ({ children }) => (
  <h2 className="section-header">{children}</h2>
);

export const Button = ({ onClick, disabled, children, className = 'primary' }) => (
  <button 
    className={className}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export const TextArea = ({ value, onChange, placeholder, rows = 8, readOnly = false }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    readOnly={readOnly}
  />
);

export const MenuItem = ({ isActive, disabled, onClick, children }) => (
  <li 
    className={isActive ? 'active' : ''}
    onClick={onClick}
    style={{ 
      opacity: disabled ? 0.5 : 1, 
      pointerEvents: disabled ? 'none' : 'auto' 
    }}
  >
    {children}
  </li>
);
