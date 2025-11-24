import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { formatTime } from '../../utils/formatters';
import './Header.css';

export const Header = ({
  lastUpdate,
  onRefresh,
  isAutoTrading,
  onToggleAutoTrading,
}) => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <div className="header__logo">
            <Activity className="header__logo-icon" size={32} />
            <h1 className="header__title">암호화폐 차익거래 시스템</h1>
          </div>
          <div className="header__actions">
            <div className="header__update-time">
              <span className="header__update-label">마지막 업데이트:</span>
              <span className="header__update-value">{formatTime(lastUpdate)}</span>
            </div>
            <button 
              onClick={onRefresh} 
              className="header__refresh-btn"
              title="새로고침"
            >
              <RefreshCw size={20} />
            </button>
            <Button
              variant={isAutoTrading ? 'danger' : 'success'}
              onClick={onToggleAutoTrading}
            >
              {isAutoTrading ? '자동거래 중지' : '자동거래 시작'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
