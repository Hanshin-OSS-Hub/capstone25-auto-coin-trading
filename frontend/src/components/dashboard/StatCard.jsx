import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color = '#3b82f6'
}) => {
  const hasChange = change !== null && change !== undefined;
  const isPositive = hasChange && change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className="stat-card__icon" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div className="stat-card__title">{title}</div>
      </div>
      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        {hasChange && (
          <div className={`stat-card__change ${isPositive ? 'stat-card__change--positive' : 'stat-card__change--negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
