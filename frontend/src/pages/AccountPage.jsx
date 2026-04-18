// src/pages/AccountPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  getBalance, getHoldings, getOrders,
  getDomesticPrice, getOverseasPrice,
  isDomestic, fmt, fmtPrice, getExchangeCode, NGROK_URL,
} from "../api/stockApi";
import "./AccountPage.css";

export default function AccountPage({ user }) {
  const [activeTab, setActiveTab] = useState("holdings");
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 실시간 현재가 저장 { symbol: { price, change, changePercent } }
  const [currentPrices, setCurrentPrices] = useState({});
  const [wsConnected, setWsConnected] = useState(false);
  const clientRef = useRef(null);
  const subsRef = useRef(new Map());

  // ── 데이터 로드 ──
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, h, o] = await Promise.allSettled([getBalance(), getHoldings(), getOrders()]);
      if (bal.status === "fulfilled") setBalance(bal.value);
      if (h.status === "fulfilled") setHoldings(h.value || []);
      if (o.status === "fulfilled") setOrders(o.value || []);
    } catch (e) { console.error("계좌 데이터 로드 실패:", e); }
    finally { setLoading(false); }
  };

  // ── 초기 현재가 REST로 가져오기 (WebSocket 연결 전 fallback) ──
  useEffect(() => {
    if (!holdings.length) return;
    (async () => {
      const prices = {};
      await Promise.allSettled(
        holdings.map(async (h) => {
          try {
            const data = isDomestic(h.market)
              ? await getDomesticPrice(h.symbol)
              : await getOverseasPrice(h.symbol, getExchangeCode(h.market));
            prices[h.symbol] = { price: parseFloat(data.price), change: data.change, changePercent: data.changePercent };
          } catch {}
        })
      );
      setCurrentPrices(prev => ({ ...prev, ...prices }));
    })();
  }, [holdings]);

  // ── WebSocket 연결 + 보유종목 구독 ──
  useEffect(() => {
    if (!holdings.length) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${NGROK_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ 계좌 WebSocket 연결");
        setWsConnected(true);

        // 보유 종목 각각 구독
        holdings.forEach((h) => {
          const domestic = isDomestic(h.market);
          const key = `${domestic ? "d" : "o"}-${h.symbol}`;
          if (subsRef.current.has(key)) return; // 중복 방지

          try {
            if (domestic) {
              client.publish({ destination: "/app/subscribe/domestic", body: h.symbol });
              const sub = client.subscribe(`/topic/domestic/${h.symbol}`, (msg) => {
                const data = JSON.parse(msg.body);
                setCurrentPrices(prev => ({
                  ...prev,
                  [h.symbol]: { price: parseFloat(data.price), change: data.change, changePercent: data.changePercent },
                }));
              });
              subsRef.current.set(key, sub);
            } else {
              const exc = getExchangeCode(h.market);
              client.publish({ destination: "/app/subscribe/overseas", body: `${h.symbol},${exc}` });
              const sub = client.subscribe(`/topic/overseas/${h.symbol}`, (msg) => {
                const data = JSON.parse(msg.body);
                setCurrentPrices(prev => ({
                  ...prev,
                  [h.symbol]: { price: parseFloat(data.price), change: data.change, changePercent: data.changePercent },
                }));
              });
              subsRef.current.set(key, sub);
            }
          } catch (e) { console.warn(`구독 실패 [${h.symbol}]:`, e); }
        });
      },
      onDisconnect: () => setWsConnected(false),
      onStompError: (f) => console.error("STOMP 에러:", f.headers?.message),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      // 구독 해제
      subsRef.current.forEach((sub) => { try { sub.unsubscribe(); } catch {} });
      subsRef.current.clear();
      client.deactivate();
    };
  }, [holdings.map(h => h.symbol).join(",")]);

  // ── 계산 ──
  const getPrice = (h) => currentPrices[h.symbol]?.price || h.avgPrice;
  const getEvalAmount = (h) => getPrice(h) * h.quantity;
  const getBuyAmount = (h) => h.avgPrice * h.quantity;
  const getProfit = (h) => getEvalAmount(h) - getBuyAmount(h);
  const getProfitRate = (h) => {
    const buy = getBuyAmount(h);
    return buy > 0 ? ((getProfit(h) / buy) * 100).toFixed(2) : "0.00";
  };

  const totalBuyAmount = holdings.reduce((sum, h) => sum + getBuyAmount(h), 0);
  const totalEvalAmount = holdings.reduce((sum, h) => sum + getEvalAmount(h), 0);
  const totalProfit = totalEvalAmount - totalBuyAmount;
  const totalProfitRate = totalBuyAmount > 0 ? ((totalProfit / totalBuyAmount) * 100).toFixed(2) : "0.00";
  const totalAsset = Number(balance) + totalEvalAmount;

  return (
    <div className="account-page">
      <div className="account-container">
        {/* 헤더 */}
        <div className="account-header">
          <div>
            <h1>내 계좌</h1>
            <p>
              {user?.name}님의 모의 투자 현황
              {wsConnected && <span className="ws-badge-acc">● LIVE</span>}
            </p>
          </div>
          <button className="refresh-btn" onClick={fetchAll}>새로고침</button>
        </div>

        {/* 자산 요약 카드 */}
        <div className="asset-summary">
          <div className="asset-card primary">
            <span className="asset-label">총 자산</span>
            <span className="asset-value">{fmt(Math.round(totalAsset))}원</span>
            <span className="asset-sub">예수금 + 실시간 평가액</span>
          </div>
          <div className="asset-card">
            <span className="asset-label">예수금</span>
            <span className="asset-value">{fmt(Math.round(balance))}원</span>
            <span className="asset-sub">주문 가능 금액</span>
          </div>
          <div className="asset-card">
            <span className="asset-label">실시간 평가액</span>
            <span className="asset-value">{fmt(Math.round(totalEvalAmount))}원</span>
            <div className={`asset-profit ${totalProfit >= 0 ? "up" : "down"}`}>
              {totalProfit >= 0 ? "+" : ""}{fmt(Math.round(totalProfit))}원 ({totalProfitRate}%)
            </div>
          </div>
        </div>

        {/* 포트폴리오 요약 바 */}
        {holdings.length > 0 && (
          <div className="portfolio-summary-bar">
            <span>총 매수금액: <strong>{fmt(Math.round(totalBuyAmount))}원</strong></span>
            <span>총 평가금액: <strong>{fmt(Math.round(totalEvalAmount))}원</strong></span>
            <span className={totalProfit >= 0 ? "up" : "down"}>
              수익: <strong>{totalProfit >= 0 ? "+" : ""}{fmt(Math.round(totalProfit))}원 ({totalProfitRate}%)</strong>
            </span>
          </div>
        )}

        {/* 탭 */}
        <div className="account-tabs">
          <button className={`acc-tab ${activeTab === "holdings" ? "active" : ""}`} onClick={() => setActiveTab("holdings")}>
            보유 종목 ({holdings.length})
          </button>
          <button className={`acc-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            주문 내역 ({orders.length})
          </button>
        </div>

        {/* 보유 종목 */}
        {activeTab === "holdings" && (
          <div className="acc-table">
            <div className="acc-table-head holdings-grid-v2">
              <span>종목</span>
              <span>현재가</span>
              <span>보유 수량</span>
              <span>평균 매수가</span>
              <span>평가 금액</span>
              <span>수익률</span>
            </div>
            {loading ? (
              <div className="acc-empty"><div className="loading-spinner" /></div>
            ) : holdings.length === 0 ? (
              <div className="acc-empty">
                <span className="acc-empty-ico">📭</span>
                <p>보유 종목이 없어요</p>
                <small>홈에서 종목을 매수해 보세요</small>
              </div>
            ) : holdings.map(h => {
              const curPrice = getPrice(h);
              const evalAmt = getEvalAmount(h);
              const profit = getProfit(h);
              const profitRate = getProfitRate(h);
              const isUp = profit >= 0;
              return (
                <div key={h.id} className="acc-table-row holdings-grid-v2">
                  <span className="acc-name">
                    <strong>{h.name}</strong>
                    <small>{h.symbol} · {h.market}</small>
                  </span>
                  <span className="acc-num">
                    <span className={`live-price ${currentPrices[h.symbol] ? "live" : ""}`}>
                      {fmtPrice(curPrice, h.market)}
                    </span>
                  </span>
                  <span className="acc-num">{fmt(h.quantity)}주</span>
                  <span className="acc-num">{fmtPrice(h.avgPrice, h.market)}</span>
                  <span className="acc-num strong">{fmt(Math.round(evalAmt))}{isDomestic(h.market) ? "원" : "$"}</span>
                  <span className={`acc-num profit-cell ${isUp ? "up" : "down"}`}>
                    {isUp ? "+" : ""}{fmt(Math.round(profit))}{isDomestic(h.market) ? "원" : "$"}
                    <small>({profitRate}%)</small>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 주문 내역 */}
        {activeTab === "orders" && (
          <div className="acc-table">
            <div className="acc-table-head orders-grid">
              <span>종목</span>
              <span>구분</span>
              <span>수량</span>
              <span>체결가</span>
              <span>주문 시간</span>
            </div>
            {loading ? (
              <div className="acc-empty"><div className="loading-spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="acc-empty">
                <span className="acc-empty-ico">📜</span>
                <p>주문 내역이 없어요</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="acc-table-row orders-grid">
                <span className="acc-name">
                  <strong>{o.name}</strong>
                  <small>{o.symbol}</small>
                </span>
                <span><span className={`order-type ${o.type === "BUY" ? "buy" : "sell"}`}>{o.type === "BUY" ? "매수" : "매도"}</span></span>
                <span className="acc-num">{fmt(o.quantity)}주</span>
                <span className="acc-num">{fmt(o.price)}원</span>
                <span className="acc-num small">{new Date(o.createdAt).toLocaleString("ko-KR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
