import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ isLoggedIn, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "홈", path: "/" },
    { label: "AI분석", path: "/ai" },
    { label: "내 계좌", path: "/account" },
  ];

  const initial = user?.name ? user.name[0].toUpperCase() : "";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <div className="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="2"
                width="9"
                height="9"
                rx="2"
                fill="white"
                opacity="0.9"
              />
              <rect
                x="13"
                y="2"
                width="9"
                height="9"
                rx="2"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="2"
                y="13"
                width="9"
                height="9"
                rx="2"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="13"
                y="13"
                width="9"
                height="9"
                rx="2"
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          <div className="logo-text-wrap">
            <span className="logo-text">CUBIC</span>
            <span className="logo-sub">증권</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="navbar-right">
          <button className="search-btn" aria-label="검색">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="search-shortcut">/</span>
          </button>

          {isLoggedIn ? (
            <div className="user-area">
              {/* 유저 아바타 + 이름 */}
              <div className="user-info">
                <div className="user-avatar">{initial}</div>
                <span className="user-name">{user?.name}님</span>
              </div>
              <div className="divider-v" />
              <button className="btn-logout" onClick={onLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <button className="btn-signup" onClick={() => navigate("/login")}>
                회원가입
              </button>
              <button className="btn-login" onClick={() => navigate("/login")}>
                로그인
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
