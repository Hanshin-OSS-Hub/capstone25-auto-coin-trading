import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainDashboard from "./pages/MainDashboard";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import { getMyInfo, logout as apiLogout } from "./api/stockApi";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // JWT 토큰이 있으면 서버에서 내 정보 확인
  useEffect(() => {
    const token = sessionStorage.getItem("cubic_token");
    if (!token) {
      setChecking(false);
      return;
    }
    (async () => {
      try {
        const me = await getMyInfo();
        setUser(me);
        sessionStorage.setItem("cubic_user", JSON.stringify(me));
      } catch {
        // 토큰 만료 → 로컬 백업 시도
        try {
          const saved = sessionStorage.getItem("cubic_user");
          if (saved) setUser(JSON.parse(saved));
        } catch {}
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    sessionStorage.setItem("cubic_user", JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
  };

  if (checking) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>불러오는 중...</div>;

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={!!user} onLogout={handleLogout} user={user} />
      <Routes>
        <Route path="/" element={<MainDashboard user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/account" element={user ? <AccountPage user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
