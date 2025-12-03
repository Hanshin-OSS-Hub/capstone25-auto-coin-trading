import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 로딩 중
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: "1.125rem",
          color: "#666",
        }}
      >
        로딩 중...
      </div>
    );
  }

  // 인증되지 않았으면 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증되었으면 자식 컴포넌트 렌더링
  return children;
};
