import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import "./Signup.css";

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, checkUsername, checkEmail } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // 입력 시 해당 필드 에러 제거
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // 아이디 검증
    if (!formData.username) {
      newErrors.username = "아이디를 입력해주세요";
    } else if (formData.username.length < 4) {
      newErrors.username = "아이디는 4자 이상이어야 합니다";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    }

    // 비밀번호 확인
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호를 다시 입력해주세요";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    // 이메일 검증 (선택사항이지만 입력했다면 형식 검증)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // 사용자 ID 중복 체크
    const usernameCheck = await checkUsername(formData.username);
    if (!usernameCheck.available) {
      setErrors({ ...errors, username: "이미 사용 중인 아이디입니다" });
      setLoading(false);
      return;
    }

    // 이메일 중복 체크 (입력한 경우)
    if (formData.email) {
      const emailCheck = await checkEmail(formData.email);
      if (!emailCheck.available) {
        setErrors({ ...errors, email: "이미 사용 중인 이메일입니다" });
        setLoading(false);
        return;
      }
    }

    // 회원가입 시도
    const result = await signup({
      username: formData.username,
      password: formData.password,
      email: formData.email || null,
      name: formData.name || null,
    });

    if (result.success) {
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } else {
      setServerError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="signup">
      <div className="signup__container">
        <Card className="signup__card">
          <div className="signup__header">
            <h1 className="signup__title">회원가입</h1>
            <p className="signup__subtitle">새 계정을 만들어보세요</p>
          </div>

          <form onSubmit={handleSubmit} className="signup__form">
            {serverError && <div className="signup__error">{serverError}</div>}

            {/* 아이디 */}
            <div className="form__group">
              <label htmlFor="username" className="form__label">
                아이디 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form__input ${
                  errors.username ? "form__input--error" : ""
                }`}
                placeholder="아이디 (4자 이상)"
                disabled={loading}
              />
              {errors.username && (
                <span className="form__error">{errors.username}</span>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="form__group">
              <label htmlFor="password" className="form__label">
                비밀번호 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form__input ${
                  errors.password ? "form__input--error" : ""
                }`}
                placeholder="비밀번호 (6자 이상)"
                disabled={loading}
              />
              {errors.password && (
                <span className="form__error">{errors.password}</span>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="form__group">
              <label htmlFor="confirmPassword" className="form__label">
                비밀번호 확인 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form__input ${
                  errors.confirmPassword ? "form__input--error" : ""
                }`}
                placeholder="비밀번호 다시 입력"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="form__error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* 이메일 */}
            <div className="form__group">
              <label htmlFor="email" className="form__label">
                이메일 <span className="optional">(선택)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form__input ${
                  errors.email ? "form__input--error" : ""
                }`}
                placeholder="example@email.com"
                disabled={loading}
              />
              {errors.email && (
                <span className="form__error">{errors.email}</span>
              )}
            </div>

            {/* 이름 */}
            <div className="form__group">
              <label htmlFor="name" className="form__label">
                이름 <span className="optional">(선택)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form__input"
                placeholder="이름"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              className="signup__button"
            >
              {loading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="signup__footer">
            <p className="signup__login-text">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="signup__login-link">
                로그인
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
