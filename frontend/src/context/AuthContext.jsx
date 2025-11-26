import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 로드 시 localStorage에서 사용자 정보 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // API 헤더에 토큰 설정
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // 로그인
  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token, ...userData } = response.data;

      // 토큰과 사용자 정보 저장
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // API 헤더에 토큰 설정
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "로그인에 실패했습니다",
      };
    }
  };

  // 회원가입
  const signup = async (userData) => {
    try {
      await api.post("/auth/signup", userData);
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "회원가입에 실패했습니다",
      };
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // 사용자 ID 중복 체크
  const checkUsername = async (username) => {
    try {
      await api.get(`/auth/check-username?username=${username}`);
      return { available: true };
    } catch (error) {
      return { available: false };
    }
  };

  // 이메일 중복 체크
  const checkEmail = async (email) => {
    try {
      await api.get(`/auth/check-email?email=${email}`);
      return { available: true };
    } catch (error) {
      return { available: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkUsername,
    checkEmail,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
