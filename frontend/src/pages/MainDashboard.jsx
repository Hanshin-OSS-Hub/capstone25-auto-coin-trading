import { useState, useEffect } from "react";
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

const SIDE_PANELS = [
  {
    id: "watchlist",
    label: "관심",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "ai",
    label: "AI분석",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "recent",
    label: "최근본",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "realtime",
    label: "실시간",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

/* ── 해/달 아이콘 ── */
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function MainDashboard({ user }) {
  const [activeGroup, setActiveGroup] = useState("시장구분");
  const [activeCat, setActiveCat] = useState("전체");
  const [activeTime, setActiveTime] = useState("실시간");
  const [activeTab, setActiveTab] = useState("실시간 차트");
  const [aiHide, setAiHide] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);

  /* ── 다크모드 ── */
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("cubic_dark");
    return saved ? saved === "true" : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("cubic_dark", dark);
  }, [dark]);

  const togglePanel = (id) => setOpenPanel((prev) => (prev === id ? null : id));

  return (
    <div className="page-wrap">
      {/* ── 좌측: 콘텐츠 영역 ── */}
      <div className="content-area">
        {/* ── 공지 배너 ── */}
        <div className="notice-bar">
          <span className="notice-dot" />
          <span>주말 서비스 전체 점검 안내</span>
          <button className="notice-btn">자세히 보기</button>
        </div>

        {/* ── 지수 티커 ── */}
        <div className="ticker-bar">
          <span className="ticker-empty">실시간 시장 데이터 연동 예정</span>
        </div>

        {/* ── 본문 ── */}
        <div className="main-area">
          <div className="content-row">
            {/* 왼쪽: 종목 섹션 */}
            <section className="stock-section">
              {/* 탭 행 */}
              <div className="tab-row">
                {["실시간 차트", "테마·섹터", "투자자 동향"].map((t) => (
                  <button
                    key={t}
                    className={`tab-btn ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t}
                  </button>
                ))}
                <div className="row-spacer" />
                <label className="risk-toggle">
                  <input
                    type="checkbox"
                    checked={aiHide}
                    onChange={() => setAiHide((v) => !v)}
                  />
                  <span className="tog-track">
                    <span className="tog-thumb" />
                  </span>
                  <span>위험종목 숨기기</span>
                </label>
              </div>

              {/* 카테고리 */}
              <div className="cat-area">
                <div className="group-tabs">
                  {CATEGORY_GROUPS.map((g) => (
                    <button
                      key={g.group}
                      className={`group-tab ${activeGroup === g.group ? "active" : ""}`}
                      onClick={() => {
                        setActiveGroup(g.group);
                        setActiveCat(g.items[0]);
                      }}
                    >
                      {g.group}
                    </button>
                  ))}
                </div>
                <div className="chip-row">
                  {CATEGORY_GROUPS.find(
                    (g) => g.group === activeGroup,
                  )?.items.map((cat) => (
                    <button
                      key={cat}
                      className={`chip ${activeCat === cat ? "active" : ""}`}
                      onClick={() => setActiveCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간 필터 */}
              <div className="time-row">
                <span className="time-lbl">조회 기간</span>
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t}
                    className={`time-btn ${activeTime === t ? "active" : ""}`}
                    onClick={() => setActiveTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* 테이블 헤더 */}
              <div className="tbl-head">
                <span style={{ textAlign: "left" }}>종목</span>
                <span>현재가</span>
                <span>등락률</span>
                <span>거래대금</span>
                <span>시가총액</span>
                <span>매수/매도 비율</span>
              </div>

              {/* 빈 상태 */}
              <div className="empty-box">
                <span className="empty-ico">📊</span>
                <p className="empty-title">종목 데이터 연동 예정</p>
                <p className="empty-desc">
                  백엔드 API 연동 후 실시간 데이터가 표시됩니다.
                </p>
              </div>
            </section>

            {/* 오른쪽: 차트 */}
            <aside className="chart-aside">
              <div className="chart-box">
                <span className="chart-ico">📈</span>
                <p>
                  종목을 선택하면
                  <br />
                  차트가 표시됩니다
                </p>
              </div>
              <div className="ai-box">
                <div className="ai-box-title">✦ AI 큐빅 분석</div>
                <p className="ai-box-desc">AI 분석 데이터 연동 예정</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── 우측: 사이드바 (네비바 바로 아래~끝까지) ── */}
      <div className="sidebar">
        {/* 슬라이드 패널 */}
        <div className={`slide-panel ${openPanel ? "open" : ""}`}>
          {openPanel === "watchlist" && <WatchlistPanel />}
          {openPanel === "ai" && <AiPanel />}
          {openPanel === "recent" && <RecentPanel />}
          {openPanel === "realtime" && <RealtimePanel />}
        </div>

        {/* 아이콘 열 */}
        <div className="icon-col">
          {SIDE_PANELS.map((p) => (
            <button
              key={p.id}
              className={`icon-btn ${openPanel === p.id ? `active icon-${p.id}` : ""}`}
              onClick={() => togglePanel(p.id)}
              title={p.label}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}

          {/* 다크모드 토글 */}
          <button
            className="darkmode-toggle"
            onClick={() => setDark((v) => !v)}
            title={dark ? "라이트 모드" : "다크 모드"}
          >
            <span className="dm-icon">{dark ? <SunIcon /> : <MoonIcon />}</span>
            <span>{dark ? "라이트" : "다크"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 패널들 ── */
function PanelShell({ title, sub, children, theme = "" }) {
  return (
    <div className={`panel-shell ${theme}`}>
      <div className="panel-hd">
        <span className="panel-title">{title}</span>
        {sub && <span className="panel-sub">{sub}</span>}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

function EmptyMsg({ icon, title, desc }) {
  return (
    <div className="panel-empty">
      <span className="panel-empty-ico">{icon}</span>
      <p className="panel-empty-title">{title}</p>
      <p className="panel-empty-desc">{desc}</p>
    </div>
  );
}

function WatchlistPanel() {
  return (
    <PanelShell
      title="관심종목"
      sub="관심 그룹에 담아보세요"
      theme="theme-rose"
    >
      <EmptyMsg
        icon="♡"
        title="관심 종목이 없어요"
        desc={"종목 옆 ☆ 버튼을 눌러\n관심종목을 추가해 보세요."}
      />
    </PanelShell>
  );
}

function AiPanel() {
  return (
    <PanelShell
      title="✦ AI 큐빅 분석"
      sub="3D 큐빅 모델 실시간 신호"
      theme="theme-violet"
    >
      <EmptyMsg
        icon="✦"
        title="AI 분석 연동 예정"
        desc={"백엔드 연동 후\n실시간 신호가 표시됩니다."}
      />
    </PanelShell>
  );
}

function RecentPanel() {
  return (
    <PanelShell title="최근 본 종목" sub="오늘 조회한 종목" theme="theme-amber">
      <EmptyMsg
        icon="🕐"
        title="최근 본 종목이 없어요"
        desc={"종목을 클릭하면\n여기에 기록됩니다."}
      />
    </PanelShell>
  );
}

function RealtimePanel() {
  return (
    <PanelShell title="실시간 체결" sub="실시간 거래 현황" theme="theme-cyan">
      <EmptyMsg
        icon="⚡"
        title="실시간 데이터 연동 예정"
        desc={"백엔드 연동 후\n체결 데이터가 표시됩니다."}
      />
    </PanelShell>
  );
}
