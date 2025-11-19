import React from 'react';
import './Card.css';

export const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerAction,
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card__action">{headerAction}</div>}
        </div>
      )}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};
