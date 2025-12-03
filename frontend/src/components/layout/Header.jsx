<<<<<<< HEAD
import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { formatTime } from '../../utils/formatters';
import './Header.css';
=======
import React from "react";
import { RefreshCw, Power, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";
import "./Header.css";
>>>>>>> develop

export const Header = ({
  lastUpdate,
  onRefresh,
  isAutoTrading,
  onToggleAutoTrading,
}) => {
<<<<<<< HEAD
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
=======
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/login");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="header">
      <div className="header__container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 0",
          }}
        >
          <div className="header__left">
            <h1 className="header__title">차익거래 시스템</h1>
            {user && (
              <span className="header__user">
                {user.name || user.username}님
              </span>
            )}
          </div>

          <div className="header__right">
            <div className="header__status">
              <span className="header__label">마지막 업데이트</span>
              <span className="header__time">{formatTime(lastUpdate)}</span>
            </div>

            <Button
              variant="outline"
              size="small"
              onClick={onRefresh}
              className="header__refresh"
            >
              <RefreshCw size={16} />
              <span>새로고침</span>
            </Button>

            <Button
              variant={isAutoTrading ? "danger" : "success"}
              size="small"
              onClick={onToggleAutoTrading}
              className="header__trading-toggle"
            >
              <Power size={16} />
              {isAutoTrading ? "자동거래 중지" : "자동거래 시작"}
            </Button>

            {user && (
              <Button
                variant="outline"
                size="small"
                onClick={handleLogout}
                className="header__logout"
              >
                <LogOut size={16} />
                <span>로그아웃</span>
              </Button>
            )}
>>>>>>> develop
          </div>
        </div>
      </div>
    </header>
  );
};
