// src/pages/AccountPage.jsx
import { useState, useEffect } from "react";
import { getBalance, getHoldings, getOrders, isDomestic, fmt, fmtPrice } from "../api/stockApi";
import "./AccountPage.css";

export default function AccountPage({ user }) {
  const [activeTab, setActiveTab] = useState("holdings"); // holdings | orders
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, h, o] = await Promise.allSettled([getBalance(), getHoldings(), getOrders()]);
      if (bal.status === "fulfilled") setBalance(bal.value);
      if (h.status === "fulfilled") setHoldings(h.value);
      if (o.status === "fulfilled") setOrders(o.value);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };

  const totalHoldingValue = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const totalAsset = Number(balance) + totalHoldingValue;

  return (
    <div className="account-page">
      <div className="account-container">
        {/* 헤더 */}
        <div className="account-header">
          <div>
            <h1>내 계좌</h1>
            <p>{user?.name}님의 모의 투자 현황</p>
          </div>
          <button className="refresh-btn" onClick={fetchAll}>새로고침</button>
        </div>

        {/* 자산 요약 카드 */}
        <div className="asset-summary">
          <div className="asset-card primary">
            <span className="asset-label">총 자산</span>
            <span className="asset-value">{fmt(totalAsset)}원</span>
            <span className="asset-sub">예수금 + 보유 종목 평가액</span>
          </div>
          <div className="asset-card">
            <span className="asset-label">예수금</span>
            <span className="asset-value">{fmt(balance)}원</span>
            <span className="asset-sub">주문 가능 금액</span>
          </div>
          <div className="asset-card">
            <span className="asset-label">보유 종목 평가액</span>
            <span className="asset-value">{fmt(totalHoldingValue)}원</span>
            <span className="asset-sub">{holdings.length}개 종목</span>
          </div>
        </div>

        {/* 탭 */}
        <div className="account-tabs">
          <button className={`acc-tab ${activeTab==="holdings"?"active":""}`} onClick={()=>setActiveTab("holdings")}>
            보유 종목 ({holdings.length})
          </button>
          <button className={`acc-tab ${activeTab==="orders"?"active":""}`} onClick={()=>setActiveTab("orders")}>
            주문 내역 ({orders.length})
          </button>
        </div>

        {/* 보유 종목 */}
        {activeTab === "holdings" && (
          <div className="acc-table">
            <div className="acc-table-head holdings-grid">
              <span>종목</span>
              <span>보유 수량</span>
              <span>평균 매수가</span>
              <span>평가 금액</span>
            </div>
            {loading ? (
              <div className="acc-empty"><div className="loading-spinner"/></div>
            ) : holdings.length === 0 ? (
              <div className="acc-empty">
                <span className="acc-empty-ico">📭</span>
                <p>보유 종목이 없어요</p>
                <small>홈에서 종목을 매수해 보세요</small>
              </div>
            ) : holdings.map(h => (
              <div key={h.id} className="acc-table-row holdings-grid">
                <span className="acc-name">
                  <strong>{h.name}</strong>
                  <small>{h.symbol} · {h.market}</small>
                </span>
                <span className="acc-num">{fmt(h.quantity)}주</span>
                <span className="acc-num">{fmtPrice(h.avgPrice, h.market)}</span>
                <span className="acc-num strong">{fmt(h.avgPrice * h.quantity)}{isDomestic(h.market)?"원":"$"}</span>
              </div>
            ))}
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
              <div className="acc-empty"><div className="loading-spinner"/></div>
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
                <span><span className={`order-type ${o.type==="BUY"?"buy":"sell"}`}>{o.type==="BUY"?"매수":"매도"}</span></span>
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
