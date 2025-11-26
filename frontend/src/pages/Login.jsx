import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 유효성 검사
    if (!formData.username || !formData.password) {
      setError("아이디와 비밀번호를 입력해주세요");
      setLoading(false);
      return;
    }

    // 로그인 시도
    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login__container">
        <Card className="login__card">
          <div className="login__header">
            <h1 className="login__title">암호화폐 차익거래 시스템</h1>
            <p className="login__subtitle">로그인하여 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="login__form">
            {error && <div className="login__error">{error}</div>}

            <div className="form__group">
              <label htmlFor="username" className="form__label">
                아이디
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form__input"
                placeholder="아이디를 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form__group">
              <label htmlFor="password" className="form__label">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form__input"
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              className="login__button"
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="login__footer">
            <p className="login__signup-text">
              계정이 없으신가요?{" "}
              <Link to="/signup" className="login__signup-link">
                회원가입
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
