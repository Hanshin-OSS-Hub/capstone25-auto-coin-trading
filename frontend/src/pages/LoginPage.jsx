import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

// ── localStorage 헬퍼 함수 ──
const getUsers = () => JSON.parse(localStorage.getItem("cubic_users") || "[]");
const saveUsers = (users) =>
  localStorage.setItem("cubic_users", JSON.stringify(users));

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "이메일을 입력해 주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.password) newErrors.password = "비밀번호를 입력해 주세요.";
    else if (form.password.length < 8)
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (mode === "signup") {
      if (!form.name) newErrors.name = "이름을 입력해 주세요.";
      if (!form.confirmPassword)
        newErrors.confirmPassword = "비밀번호를 한 번 더 입력해 주세요.";
      else if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    const users = getUsers();

    if (mode === "signup") {
      // ── 회원가입: 이미 존재하는 이메일인지 확인 ──
      const exists = users.find((u) => u.email === form.email);
      if (exists) {
        setErrors({ email: "이미 가입된 이메일이에요." });
        setLoading(false);
        return;
      }
      const newUser = {
        email: form.email,
        password: form.password,
        name: form.name,
      };
      saveUsers([...users, newUser]);
      onLogin({ email: newUser.email, name: newUser.name });
    } else {
      // ── 로그인: 이메일 + 비밀번호 일치 확인 ──
      const user = users.find(
        (u) => u.email === form.email && u.password === form.password,
      );
      if (!user) {
        setErrors({ password: "이메일 또는 비밀번호가 올바르지 않아요." });
        setLoading(false);
        return;
      }
      onLogin({ email: user.email, name: user.name });
    }

    setLoading(false);
    navigate("/");
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setForm({ email: "", password: "", name: "", confirmPassword: "" });
  };

  return (
    <div className="login-page">
      {/* 왼쪽 브랜딩 패널 */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="brand-logo" onClick={() => navigate("/")}>
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v6H3zM3 15h18v6H3zM9 9h6v6H9z" fill="white" />
              </svg>
            </div>
            <span className="brand-name">큐빅증권</span>
          </div>

          <div className="brand-headline">
            <h2>
              AI가 분석하는
              <br />
              스마트한 투자
            </h2>
            <p>
              3D 큐빅 모델 기반 AI가 실시간으로
              <br />
              최적의 투자 타이밍을 알려드립니다.
            </p>
          </div>

          <div className="brand-features">
            {[
              {
                icon: "📊",
                title: "실시간 시장 분석",
                desc: "AI 기반 실시간 종목 분석",
              },
              {
                icon: "🎯",
                title: "3D 큐빅 모델",
                desc: "입체적 데이터 시각화",
              },
              { icon: "🔔", title: "맞춤 알림", desc: "내 종목 실시간 알림" },
            ].map((f) => (
              <div key={f.title} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 폼 패널 */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              로그인
            </button>
            <button
              className={`mode-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              회원가입
            </button>
          </div>

          <div className="form-header">
            <h1>
              {mode === "login"
                ? "다시 만나서 반가워요 👋"
                : "큐빅증권 가입하기 🎉"}
            </h1>
            <p>
              {mode === "login"
                ? "계속하려면 로그인해 주세요."
                : "계정을 만들고 AI 투자를 시작하세요."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-msg">{errors.name}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-msg">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                비밀번호
                {mode === "login" && (
                  <button type="button" className="forgot-link">
                    비밀번호 찾기
                  </button>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={
                  mode === "signup" ? "8자 이상 입력해 주세요" : "비밀번호 입력"
                }
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <span className="error-msg">{errors.password}</span>
              )}
            </div>

            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 한 번 더 입력해 주세요"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && (
                  <span className="error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "로그인"
              ) : (
                "가입하기"
              )}
            </button>
          </form>

          <p className="switch-hint">
            {mode === "login" ? (
              <>
                계정이 없으신가요?{" "}
                <button onClick={() => switchMode("signup")}>회원가입</button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{" "}
                <button onClick={() => switchMode("login")}>로그인</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
