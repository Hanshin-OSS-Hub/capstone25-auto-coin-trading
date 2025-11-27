import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  History,
  Settings,
  BarChart3, //줄 추가***********
} from "lucide-react";
import "./Navigation.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "opportunities", label: "차익거래 기회", icon: TrendingUp },
  { id: "chart", label: "실시간 차트", icon: BarChart3 }, //줄 추가*****************
  { id: "trades", label: "거래 내역", icon: History },
  { id: "settings", label: "설정", icon: Settings },
];

export const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="navigation">
      <div className="navigation__container">
        <div className="navigation__nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`navigation__tab ${
                  activeTab === item.id ? "navigation__tab--active" : ""
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
