// src/components/OrderBook.jsx
import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getDomesticOrderbook, isDomestic, fmt, NGROK_URL } from "../api/stockApi";
import "./OrderBook.css";

export default function OrderBook({ stock }) {
  const [orderbook, setOrderbook] = useState(null);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState("orderbook"); // orderbook | trades
  const [loading, setLoading] = useState(false);
  const clientRef = useRef(null);
  const subsRef = useRef([]);

  // 국내 주식만 호가창 지원
  if (!stock || !isDomestic(stock.market)) return null;

  // REST로 초기 호가 로드
  useEffect(() => {
    if (!stock) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getDomesticOrderbook(stock.symbol);
        setOrderbook(data);
      } catch (e) { console.warn("호가 로드 실패:", e); }
      finally { setLoading(false); }
    })();
    setTrades([]);
  }, [stock.symbol]);

  // WebSocket 실시간 호가 + 체결
  useEffect(() => {
    if (!stock) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${NGROK_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        // 국내 구독하면 호가+체결 자동 구독됨
        client.publish({ destination: "/app/subscribe/domestic", body: stock.symbol });

        // 호가창 실시간
        const obSub = client.subscribe(`/topic/orderbook/${stock.symbol}`, (msg) => {
          try { setOrderbook(JSON.parse(msg.body)); } catch {}
        });
        subsRef.current.push(obSub);

        // 체결 실시간
        const ttSub = client.subscribe(`/topic/tradetick/${stock.symbol}`, (msg) => {
          try {
            const tick = JSON.parse(msg.body);
            setTrades(prev => [tick, ...prev].slice(0, 30));
          } catch {}
        });
        subsRef.current.push(ttSub);
      },
    });
    client.activate();
    clientRef.current = client;

    return () => {
      subsRef.current.forEach(s => { try { s.unsubscribe(); } catch {} });
      subsRef.current = [];
      client.deactivate();
    };
  }, [stock.symbol]);

  const maxQty = orderbook ? Math.max(
    ...((orderbook.asks || []).map(a => Number(a.quantity) || 0)),
    ...((orderbook.bids || []).map(b => Number(b.quantity) || 0)),
    1
  ) : 1;

  return (
    <div className="orderbook-wrap">
      <div className="ob-tabs">
        <button className={`ob-tab ${activeTab === "orderbook" ? "active" : ""}`} onClick={() => setActiveTab("orderbook")}>호가</button>
        <button className={`ob-tab ${activeTab === "trades" ? "active" : ""}`} onClick={() => setActiveTab("trades")}>체결</button>
      </div>

      {activeTab === "orderbook" && (
        <div className="ob-body">
          {loading || !orderbook ? (
            <div className="ob-loading">호가 로딩 중...</div>
          ) : (
            <>
              {/* 매도호가 (위) — 역순으로 표시 */}
              <div className="ob-section asks">
                {[...(orderbook.asks || [])].reverse().map((a, i) => (
                  <div key={`ask-${i}`} className="ob-row ask">
                    <div className="ob-bar-wrap">
                      <div className="ob-bar ask-bar" style={{ width: `${(Number(a.quantity) / maxQty) * 100}%` }} />
                    </div>
                    <span className="ob-qty">{fmt(a.quantity)}</span>
                    <span className="ob-price ask-price">{fmt(a.price)}</span>
                  </div>
                ))}
              </div>

              {/* 현재가 */}
              <div className="ob-current">
                <span className="ob-current-price">{fmt(stock.price)}</span>
                <span className="ob-current-label">현재가</span>
              </div>

              {/* 매수호가 (아래) */}
              <div className="ob-section bids">
                {(orderbook.bids || []).map((b, i) => (
                  <div key={`bid-${i}`} className="ob-row bid">
                    <span className="ob-price bid-price">{fmt(b.price)}</span>
                    <span className="ob-qty">{fmt(b.quantity)}</span>
                    <div className="ob-bar-wrap">
                      <div className="ob-bar bid-bar" style={{ width: `${(Number(b.quantity) / maxQty) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 총 잔량 */}
              <div className="ob-total">
                <span className="ask-total">매도 {fmt(orderbook.totalAskQty)}</span>
                <span className="bid-total">매수 {fmt(orderbook.totalBidQty)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "trades" && (
        <div className="ob-trades">
          <div className="ob-trades-head">
            <span>체결가</span>
            <span>수량</span>
            <span>구분</span>
          </div>
          {trades.length === 0 ? (
            <div className="ob-loading">체결 대기 중...</div>
          ) : trades.map((t, i) => (
            <div key={i} className={`ob-trade-row ${t.tradeType === "BUY" ? "buy" : "sell"}`}>
              <span className="ob-trade-price">{fmt(t.price)}</span>
              <span className="ob-trade-vol">{fmt(t.volume)}</span>
              <span className={`ob-trade-type ${t.tradeType === "BUY" ? "buy" : "sell"}`}>
                {t.tradeType === "BUY" ? "매수" : "매도"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
