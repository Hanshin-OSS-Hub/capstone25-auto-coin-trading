import { useState } from "react";
import "./MainDashboard.css";

const CATEGORY_GROUPS = [
  { group: "시장구분", items: ["전체", "코스피", "코스닥", "ETF", "해외주식"] },
  {
    group: "정렬기준",
    items: ["거래대금", "거래량", "급등", "급락", "시가총액"],
  },
  {
    group: "테마·섹터",
    items: [
      "반도체",
      "2차전지",
      "AI·로봇",
      "바이오",
      "방산",
      "건설",
      "금융",
      "에너지",
    ],
  },
];

const TIME_FILTERS = ["실시간", "1일", "1주", "1개월", "3개월", "1년"];

export default function MainDashboard({ user }) {
  const [activeGroup, setActiveGroup] = useState("시장구분");
  const [activeCat, setActiveCat] = useState("전체");
  const [activeTime, setActiveTime] = useState("실시간");
  const [activeTab, setActiveTab] = useState("실시간 차트");
  const [aiHide, setAiHide] = useState(false);

  return (
    <div className="dashboard">
      {/* ── 공지 배너 ── */}
      <div className="notice-bar">
        <span className="notice-dot" />
        <span className="notice-text">주말 서비스 전체 점검 안내</span>
        <button className="notice-btn">자세히 보기</button>
      </div>

      {/* ── 지수 티커 (빈 상태) ── */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          <span className="ticker-empty">실시간 시장 데이터 연동 예정</span>
        </div>
      </div>

      {/* ── 메인 레이아웃 ── */}
      <div className="dash-layout">
        {/* ── 왼쪽: 종목 리스트 ── */}
        <section className="stock-section">
          {/* 상단 탭 */}
          <div className="section-tabs">
            {["실시간 차트", "테마·섹터", "투자자 동향"].map((t) => (
              <button
                key={t}
                className={`stab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
            <div className="tab-spacer" />
            <label className="ai-toggle">
              <input
                type="checkbox"
                checked={aiHide}
                onChange={() => setAiHide((v) => !v)}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span>위험종목 숨기기</span>
            </label>
          </div>

          {/* 카테고리 필터 */}
          <div className="cat-panel">
            <div className="cat-group-tabs">
              {CATEGORY_GROUPS.map((g) => (
                <button
                  key={g.group}
                  className={`cgroup-tab ${activeGroup === g.group ? "active" : ""}`}
                  onClick={() => {
                    setActiveGroup(g.group);
                    setActiveCat(g.items[0]);
                  }}
                >
                  {g.group}
                </button>
              ))}
            </div>
            <div className="cat-chips">
              {CATEGORY_GROUPS.find((g) => g.group === activeGroup)?.items.map(
                (cat) => (
                  <button
                    key={cat}
                    className={`cat-chip ${activeCat === cat ? "active" : ""}`}
                    onClick={() => setActiveCat(cat)}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* 시간 필터 */}
          <div className="time-row">
            <span className="time-label">조회 기간</span>
            {TIME_FILTERS.map((t) => (
              <button
                key={t}
                className={`time-chip ${activeTime === t ? "active" : ""}`}
                onClick={() => setActiveTime(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 테이블 헤더 */}
          <div className="tbl-head">
            <span className="col-rank">종목</span>
            <span className="col-price">현재가</span>
            <span className="col-change">등락률</span>
            <span className="col-volume">거래대금</span>
            <span className="col-mktcap">시가총액</span>
            <span className="col-bar">매수/매도 비율</span>
          </div>

          {/* 빈 상태 */}
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p className="empty-title">종목 데이터 연동 예정</p>
            <p className="empty-desc">
              백엔드 API 연동 후 실시간 데이터가 표시됩니다.
            </p>
          </div>
        </section>

        {/* ── 오른쪽 패널 ── */}
        <aside className="side-panel">
          {/* 종목 차트 영역 */}
          <div className="stock-card">
            <div className="sc-placeholder">
              <div className="sc-placeholder-icon">📈</div>
              <p>
                종목을 선택하면
                <br />
                차트가 표시됩니다
              </p>
            </div>
          </div>

          {/* AI 큐빅 분석 */}
          <div className="ai-card">
            <div className="ai-card-title">
              <span className="ai-icon">✦</span> AI 큐빅 분석
            </div>
            <div className="ai-empty">
              <p>AI 분석 데이터 연동 예정</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
