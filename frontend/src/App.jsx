import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainDashboard from "./pages/MainDashboard";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import { logout as apiLogout } from "./api/stockApi";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cubic_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem("cubic_user", JSON.stringify(userInfo));
  };

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
    localStorage.removeItem("cubic_user");
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={!!user} onLogout={handleLogout} user={user} />
      <Routes>
        <Route path="/" element={<MainDashboard user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/account" element={user ? <AccountPage user={user} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
