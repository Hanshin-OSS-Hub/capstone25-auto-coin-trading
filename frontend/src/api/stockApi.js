// src/api/stockApi.js
import axios from "axios";

const NGROK_URL = "https://rockiness-venture-reptilian.ngrok-free.dev";

// 모든 요청에 withCredentials: true → 세션 쿠키 유지
const api = axios.create({
  baseURL: NGROK_URL,
  headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

/* ═══════════ 회원 ═══════════ */
export const signUp = async (email, password, name) => {
  const res = await api.post("/api/users/signup", { email, password, name });
  return res.data;
};
export const login = async (email, password) => {
  const res = await api.post("/api/users/login", { email, password });
  return res.data;
};
export const logout = async () => {
  try { await api.post("/api/users/logout"); } catch {}
};
export const getMyInfo = async () => {
  const res = await api.get("/api/users/me");
  return res.data;
};

/* ═══════════ 매매 (인증) ═══════════ */
export const buyStock = async (payload) => {
  const res = await api.post("/api/trade/buy", payload);
  return res.data;
};
export const sellStock = async (payload) => {
  const res = await api.post("/api/trade/sell", payload);
  return res.data;
};
export const getBalance = async () => { const r = await api.get("/api/trade/balance"); return r.data; };
export const getHoldings = async () => { const r = await api.get("/api/trade/holdings"); return r.data; };
export const getOrders = async () => { const r = await api.get("/api/trade/orders"); return r.data; };

/* ═══════════ 시세 (공개) ═══════════ */
export const searchStocks = async (keyword) => {
  const res = await api.get(`/api/stocks/search?keyword=${encodeURIComponent(keyword)}`);
  return res.data;
};
export const getDomesticPrice = async (symbol) => {
  const res = await api.get(`/api/stocks/domestic/${symbol}`);
  return res.data;
};
export const getOverseasPrice = async (symbol, exchange = "NAS") => {
  const res = await api.get(`/api/stocks/overseas/${symbol}?exchange=${exchange}`);
  return res.data;
};
export const getDomesticChart = async (symbol, period = "D") => {
  const res = await api.get(`/api/stocks/chart/domestic/${symbol}?period=${period}`);
  return res.data;
};
export const getOverseasChart = async (symbol, exchange = "NAS", period = "0") => {
  const res = await api.get(`/api/stocks/chart/overseas/${symbol}?exchange=${exchange}&period=${period}`);
  return res.data;
};
export const getDomesticMinute = async (symbol, timeUnit = 5) => {
  const res = await api.get(`/api/stocks/chart/domestic/${symbol}/minute?timeUnit=${timeUnit}`);
  return res.data;
};
export const getOverseasMinute = async (symbol, exchange = "NAS", timeUnit = 5) => {
  const res = await api.get(`/api/stocks/chart/overseas/${symbol}/minute?exchange=${exchange}&timeUnit=${timeUnit}`);
  return res.data;
};

/* ═══════════ 유틸 ═══════════ */
export const getExchangeCode = (market) => ({ NASDAQ: "NAS", NYSE: "NYS", AMEX: "AMS" }[market] || "NAS");
export const isDomestic = (market) => ["KOSPI", "KOSDAQ", "ETF"].includes(market);
export const fmt = (n) => { const num = Number(n); return isNaN(num) ? n : num.toLocaleString("ko-KR"); };
export const fmtPrice = (price, market) => !price ? "-" : isDomestic(market) ? `${fmt(price)}원` : `$${Number(price).toFixed(2)}`;

export const DOMESTIC_STOCKS = [
  { symbol: "005930", name: "삼성전자", market: "KOSPI" },
  { symbol: "000660", name: "SK하이닉스", market: "KOSPI" },
  { symbol: "373220", name: "LG에너지솔루션", market: "KOSPI" },
  { symbol: "005380", name: "현대차", market: "KOSPI" },
  { symbol: "000270", name: "기아", market: "KOSPI" },
  { symbol: "006400", name: "삼성SDI", market: "KOSPI" },
  { symbol: "051910", name: "LG화학", market: "KOSPI" },
  { symbol: "035420", name: "NAVER", market: "KOSPI" },
  { symbol: "035720", name: "카카오", market: "KOSPI" },
  { symbol: "068270", name: "셀트리온", market: "KOSPI" },
  { symbol: "005490", name: "POSCO홀딩스", market: "KOSPI" },
  { symbol: "055550", name: "신한지주", market: "KOSPI" },
  { symbol: "003670", name: "포스코퓨처엠", market: "KOSDAQ" },
  { symbol: "247540", name: "에코프로비엠", market: "KOSDAQ" },
  { symbol: "086520", name: "에코프로", market: "KOSDAQ" },
  { symbol: "041510", name: "에스엠", market: "KOSDAQ" },
];
export const OVERSEAS_STOCKS = [
  { symbol: "AAPL", name: "Apple",     market: "NASDAQ", exchange: "NAS" },
  { symbol: "NVDA", name: "NVIDIA",    market: "NASDAQ", exchange: "NAS" },
  { symbol: "TSLA", name: "Tesla",     market: "NASDAQ", exchange: "NAS" },
  { symbol: "MSFT", name: "Microsoft", market: "NASDAQ", exchange: "NAS" },
  { symbol: "AMZN", name: "Amazon",    market: "NASDAQ", exchange: "NAS" },
  { symbol: "GOOG", name: "Alphabet",  market: "NASDAQ", exchange: "NAS" },
  { symbol: "META", name: "Meta",      market: "NASDAQ", exchange: "NAS" },
];

export { NGROK_URL };
export default api;
