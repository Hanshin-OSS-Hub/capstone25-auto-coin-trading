import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainDashboard from "./pages/MainDashboard";
import LoginPage from "./pages/LoginPage";
import "./App.css";

export default function App() {
  // 새로고침해도 로그인 유지 - sessionStorage에서 불러오기
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("cubic_session");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    sessionStorage.setItem("cubic_session", JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("cubic_session");
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={!!user} onLogout={handleLogout} user={user} />
      <Routes>
        <Route path="/" element={<MainDashboard user={user} />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/account"
          element={
            user ? (
              <div style={{ padding: 40 }}>내 계좌 페이지 (준비 중)</div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
