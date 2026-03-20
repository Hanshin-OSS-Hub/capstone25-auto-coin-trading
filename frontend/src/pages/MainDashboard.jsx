import { useState } from "react";
import "./MainDashboard.css";

// ── 더미 데이터 ──
const MARKET_INDICES = [
  {
    label: "KOSPI",
    value: "2,612.35",
    change: "+14.20",
    pct: "+0.55%",
    up: true,
  },
  {
    label: "KOSDAQ",
    value: "731.84",
    change: "-3.12",
    pct: "-0.43%",
    up: false,
  },
  {
    label: "KOSPI200",
    value: "348.72",
    change: "+2.11",
    pct: "+0.61%",
    up: true,
  },
  {
    label: "달러/원",
    value: "1,502.45",
    change: "+2.75",
    pct: "+0.18%",
    up: true,
  },
  {
    label: "나스닥",
    value: "22,090.69",
    change: "-61.73",
    pct: "-0.27%",
    up: false,
  },
  {
    label: "S&P 500",
    value: "6,606.49",
    change: "-18.21",
    pct: "-0.27%",
    up: false,
  },
  { label: "WTI", value: "68.42", change: "+0.83", pct: "+1.23%", up: true },
];

const CATEGORY_GROUPS = [
  {
    group: "시장구분",
    items: ["전체", "코스피", "코스닥", "ETF", "해외주식"],
  },
  {
    group: "정렬기준",
    items: ["거래대금", "거래량", "급등", "급락", "시가총액"],
  },
  {
    group: "테마/섹터",
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

const STOCKS = [
  {
    rank: 1,
    name: "삼성전자",
    code: "005930",
    logo: "삼",
    color: "#1428A0",
    price: "199,500",
    change: -0.49,
    volume: "166억",
    mktCap: "1,191조",
    sector: "반도체",
    buy: 33,
    sell: 67,
  },
  {
    rank: 2,
    name: "SK하이닉스",
    code: "000660",
    logo: "SK",
    color: "#EA002C",
    price: "1,004,000",
    change: -0.88,
    volume: "73억",
    mktCap: "731조",
    sector: "반도체",
    buy: 17,
    sell: 83,
  },
  {
    rank: 3,
    name: "삼성E&A",
    code: "028260",
    logo: "삼",
    color: "#1428A0",
    price: "39,650",
    change: 21.62,
    volume: "27억",
    mktCap: "7.2조",
    sector: "건설",
    buy: 58,
    sell: 42,
  },
  {
    rank: 4,
    name: "SOXL",
    code: "SOXL",
    logo: "3×",
    color: "#5A4FCF",
    price: "79,694",
    change: -3.11,
    volume: "27억",
    mktCap: "-",
    sector: "ETF",
    buy: 39,
    sell: 61,
  },
  {
    rank: 5,
    name: "SMCZ",
    code: "SMCZ",
    logo: "안",
    color: "#FF4B4B",
    price: "82,993",
    change: 50.33,
    volume: "20억",
    mktCap: "-",
    sector: "AI·로봇",
    buy: 42,
    sell: 58,
  },
  {
    rank: 6,
    name: "GS건설",
    code: "006360",
    logo: "GS",
    color: "#005BAC",
    price: "33,400",
    change: 28.7,
    volume: "18억",
    mktCap: "2.1조",
    sector: "건설",
    buy: 45,
    sell: 55,
  },
  {
    rank: 7,
    name: "아지트라",
    code: "096530",
    logo: "아",
    color: "#2D2D2D",
    price: "413",
    change: 56.38,
    volume: "17억",
    mktCap: "0.4조",
    sector: "바이오",
    buy: 48,
    sell: 52,
  },
  {
    rank: 8,
    name: "SK이터닉스",
    code: "403360",
    logo: "SK",
    color: "#EA002C",
    price: "58,500",
    change: 8.93,
    volume: "16억",
    mktCap: "3.8조",
    sector: "에너지",
    buy: 46,
    sell: 54,
  },
  {
    rank: 9,
    name: "두산에너빌리티",
    code: "034020",
    logo: "두",
    color: "#E31E24",
    price: "109,400",
    change: 2.91,
    volume: "16억",
    mktCap: "8.6조",
    sector: "방산",
    buy: 31,
    sell: 69,
  },
  {
    rank: 10,
    name: "한미반도체",
    code: "042700",
    logo: "한",
    color: "#0055A4",
    price: "113,200",
    change: 4.62,
    volume: "15억",
    mktCap: "5.4조",
    sector: "반도체",
    buy: 52,
    sell: 48,
  },
];

const NEWS = [
  {
    tag: "AI분석",
    text: "삼성전자 — 3D 큐빅 모델 상승 신호 포착",
    time: "30분 전",
    hot: true,
  },
  {
    tag: "AI분석",
    text: "반도체 섹터 단기 과매도 구간 진입",
    time: "1시간 전",
    hot: false,
  },
  {
    tag: "공시",
    text: "기관 순매수 Top 10 종목이에요.",
    time: "1시간 전",
    hot: false,
  },
  {
    tag: "공시",
    text: "외국인 순매도 Top 10 종목이에요.",
    time: "2시간 전",
    hot: false,
  },
  {
    tag: "뉴스",
    text: "2026년 반도체 수출 전년 대비 +18%",
    time: "3시간 전",
    hot: false,
  },
];

function Sparkline({ data, up }) {
  const w = 80,
    h = 32;
  const min = Math.min(...data),
    max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#ef4444" : "#3b82f6"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CandleChart() {
  const candles = Array.from({ length: 22 }, (_, i) => {
    const base = 80 + Math.sin(i * 0.4) * 15 + i * 0.8;
    const o = base + (Math.random() - 0.5) * 6;
    const c = base + (Math.random() - 0.5) * 8;
    return {
      o,
      c,
      h: Math.max(o, c) + Math.random() * 4,
      l: Math.min(o, c) - Math.random() * 4,
      up: c >= o,
    };
  });
  const allVals = candles.flatMap((c) => [c.h, c.l]);
  const minV = Math.min(...allVals),
    maxV = Math.max(...allVals);
  const scY = (v) => 4 + ((maxV - v) / (maxV - minV)) * 76;
  const cw = 7,
    gap = 3,
    startX = 6;

  return (
    <svg width="100%" viewBox="0 0 220 105" style={{ display: "block" }}>
      {candles.map((c, i) => {
        const x = startX + i * (cw + gap);
        const cx = x + cw / 2;
        const color = c.up ? "#ef4444" : "#3b82f6";
        const top = Math.min(scY(c.o), scY(c.c));
        const bh = Math.max(Math.abs(scY(c.o) - scY(c.c)), 1);
        const vol = 85 + ((c.h - c.l) / (maxV - minV)) * 12;
        return (
          <g key={i}>
            <rect
              x={x}
              y={88}
              width={cw}
              height={vol - 85}
              fill={color}
              opacity="0.35"
              rx="1"
            />
            <line
              x1={cx}
              y1={scY(c.h)}
              x2={cx}
              y2={scY(c.l)}
              stroke={color}
              strokeWidth="1"
            />
            <rect x={x} y={top} width={cw} height={bh} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

export default function MainDashboard({ user }) {
  const [activeGroup, setActiveGroup] = useState("시장구분");
  const [activeCat, setActiveCat] = useState("전체");
  const [activeTime, setActiveTime] = useState("실시간");
  const [selectedStock, setSelectedStock] = useState(STOCKS[1]);
  const [aiHide, setAiHide] = useState(false);
  const [watchlist, setWatchlist] = useState(new Set());

  const toggleWatch = (rank) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      next.has(rank) ? next.delete(rank) : next.add(rank);
      return next;
    });
  };

  return (
    <div className="dashboard">
      {/* ── 공지 배너 ── */}
      <div className="notice-bar">
        <span className="notice-dot" />
        <span className="notice-text">
          주말 서비스 전체 점검 안내 (3/22 02:00 ~ 06:00)
        </span>
        <button className="notice-btn">자세히 보기</button>
      </div>

      {/* ── 지수 티커 ── */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          {MARKET_INDICES.map((idx, i) => (
            <div key={i} className="ticker-item">
              <span className="ticker-label">{idx.label}</span>
              <span className={`ticker-val ${idx.up ? "up" : "down"}`}>
                {idx.value}
              </span>
              <span className={`ticker-chg ${idx.up ? "up" : "down"}`}>
                {idx.change} ({idx.pct})
              </span>
              <Sparkline
                data={
                  idx.up
                    ? [10, 12, 11, 14, 13, 16, 15, 17, 16, 18]
                    : [18, 16, 17, 14, 15, 13, 14, 11, 12, 10]
                }
                up={idx.up}
              />
              {i < MARKET_INDICES.length - 1 && <div className="ticker-sep" />}
            </div>
          ))}
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
                className={`stab ${t === "실시간 차트" ? "active" : ""}`}
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

          {/* 카테고리 필터 — 그룹별 */}
          <div className="cat-panel">
            {/* 그룹 탭 */}
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
            {/* 아이템 칩 */}
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
            <span className="update-time">기준 19:52 · 장 마감</span>
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

          {/* 종목 rows */}
          <div className="stock-list">
            {STOCKS.map((s) => (
              <div
                key={s.rank}
                className={`stock-row ${selectedStock.rank === s.rank ? "selected" : ""}`}
                onClick={() => setSelectedStock(s)}
              >
                <div className="col-rank">
                  <button
                    className={`watch-btn ${watchlist.has(s.rank) ? "on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatch(s.rank);
                    }}
                    aria-label="관심종목"
                  >
                    {watchlist.has(s.rank) ? "★" : "☆"}
                  </button>
                  <span className="rank-n">{s.rank}</span>
                  <div className="s-logo" style={{ background: s.color }}>
                    {s.logo}
                  </div>
                  <div className="s-info">
                    <span className="s-name">{s.name}</span>
                    <span className="s-code">{s.code}</span>
                  </div>
                  <span className="s-sector">{s.sector}</span>
                </div>
                <span className="col-price">{s.price}원</span>
                <span className={`col-change ${s.change > 0 ? "up" : "down"}`}>
                  {s.change > 0 ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
                </span>
                <span className="col-volume">{s.volume}</span>
                <span className="col-mktcap">{s.mktCap}</span>
                <div className="col-bar">
                  <div className="ratio-bar">
                    <div className="ratio-buy" style={{ width: `${s.buy}%` }} />
                    <div
                      className="ratio-sell"
                      style={{ width: `${s.sell}%` }}
                    />
                  </div>
                  <div className="ratio-nums">
                    <span className="rn-buy">{s.buy}</span>
                    <span className="rn-sell">{s.sell}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 오른쪽 패널 ── */}
        <aside className="side-panel">
          {/* 선택 종목 차트 */}
          <div className="stock-card">
            <div className="sc-header">
              <div
                className="sc-logo"
                style={{ background: selectedStock.color }}
              >
                {selectedStock.logo}
              </div>
              <div className="sc-meta">
                <div className="sc-name">{selectedStock.name}</div>
                <div className="sc-code">
                  {selectedStock.code} · {selectedStock.sector}
                </div>
              </div>
              <button
                className={`sc-watch ${watchlist.has(selectedStock.rank) ? "on" : ""}`}
                onClick={() => toggleWatch(selectedStock.rank)}
              >
                {watchlist.has(selectedStock.rank) ? "★ 관심" : "☆ 관심"}
              </button>
            </div>

            <div className="sc-price-row">
              <span
                className={`sc-price ${selectedStock.change > 0 ? "up" : "down"}`}
              >
                {selectedStock.price}원
              </span>
              <span
                className={`sc-change ${selectedStock.change > 0 ? "up" : "down"}`}
              >
                {selectedStock.change > 0 ? "▲" : "▼"}{" "}
                {Math.abs(selectedStock.change).toFixed(2)}%
              </span>
            </div>

            <div className="sc-stats">
              <div className="sc-stat">
                <span>거래대금</span>
                <b>{selectedStock.volume}</b>
              </div>
              <div className="sc-stat">
                <span>시총</span>
                <b>{selectedStock.mktCap}</b>
              </div>
              <div className="sc-stat">
                <span>AI신호</span>
                <b className="ai-signal">매수</b>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-type-tabs">
                {["일봉", "주봉", "월봉"].map((t) => (
                  <button
                    key={t}
                    className={`ct-tab ${t === "일봉" ? "active" : ""}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <CandleChart />
              <div className="chart-dates">
                <span>25.12</span>
                <span>26.01</span>
                <span>26.02</span>
                <span>26.03</span>
              </div>
            </div>
          </div>

          {/* AI 큐빅 분석 */}
          <div className="ai-card">
            <div className="ai-card-title">
              <span className="ai-icon">✦</span> AI 큐빅 분석
            </div>
            <div className="ai-items">
              {NEWS.map((n, i) => (
                <div key={i} className="ai-item">
                  <span
                    className={`ai-tag ${n.tag === "AI분석" ? "tag-ai" : n.tag === "공시" ? "tag-pub" : "tag-news"}`}
                  >
                    {n.tag}
                  </span>
                  <span className="ai-text">{n.text}</span>
                  <span className="ai-time">{n.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 내 관심종목 */}
          {watchlist.size > 0 && (
            <div className="watch-card">
              <div className="watch-title">★ 관심종목 ({watchlist.size})</div>
              {STOCKS.filter((s) => watchlist.has(s.rank)).map((s) => (
                <div key={s.rank} className="watch-item">
                  <div className="s-logo sm" style={{ background: s.color }}>
                    {s.logo}
                  </div>
                  <span className="w-name">{s.name}</span>
                  <span className={`w-chg ${s.change > 0 ? "up" : "down"}`}>
                    {s.change > 0 ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
