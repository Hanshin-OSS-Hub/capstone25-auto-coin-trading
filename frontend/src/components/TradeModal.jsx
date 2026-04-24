// src/components/TradeModal.jsx
import { useState, useEffect } from "react";
import { buyStock, sellStock, getBalance, getHoldings, isDomestic, fmt, fmtPrice } from "../api/stockApi";
import "./TradeModal.css";

export default function TradeModal({ stock, onClose, onSuccess }) {
  const [mode, setMode] = useState("buy");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [holding, setHolding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (stock?.price) setPrice(stock.price);
    fetchUserData();
  }, [stock]);

  const fetchUserData = async () => {
    try {
      const [bal, holdings] = await Promise.all([getBalance(), getHoldings()]);
      setBalance(bal);
      setHolding(holdings.find(x => x.symbol === stock.symbol) || null);
    } catch (e) { console.warn("잔고 조회 실패:", e); }
  };

  const total = Number(price) * Number(quantity);
  const canBuy = total <= balance && quantity > 0 && price > 0;
  const canSell = holding && quantity <= holding.quantity && quantity > 0;

  const handleSubmit = async () => {
    setLoading(true); setMessage(null);
    try {
      const payload = { symbol: stock.symbol, name: stock.name, market: stock.market, quantity: Number(quantity), price: Number(price) };
      if (mode === "buy") { await buyStock({ ...payload, type: "BUY" }); setMessage({ type: "success", text: "매수 완료!" }); }
      else { await sellStock({ ...payload, type: "SELL" }); setMessage({ type: "success", text: "매도 완료!" }); }
      await fetchUserData();
      onSuccess?.();
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      const msg = typeof e.response?.data === "string" ? e.response.data : "주문 실패";
      setMessage({ type: "error", text: msg });
    } finally { setLoading(false); }
  };

  if (!stock) return null;

  return (
    <div className="trade-modal-backdrop" onClick={onClose}>
      <div className="trade-modal" onClick={e => e.stopPropagation()}>
        <div className="trade-modal-hd">
          <div><h3>{stock.name}</h3><span className="tm-symbol">{stock.symbol} · {stock.market}</span></div>
          <button className="tm-close" onClick={onClose}>✕</button>
        </div>
        <div className="trade-modal-tabs">
          <button className={`tm-tab buy ${mode==="buy"?"active":""}`} onClick={()=>setMode("buy")}>매수</button>
          <button className={`tm-tab sell ${mode==="sell"?"active":""}`} onClick={()=>setMode("sell")}>매도</button>
        </div>
        <div className="trade-modal-body">
          <div className="tm-info-row"><span>현재가</span><strong>{fmtPrice(stock.price, stock.market)}</strong></div>
          {mode === "buy" ? (
            <div className="tm-info-row"><span>주문 가능 금액</span><strong>{fmt(Math.round(balance))}원</strong></div>
          ) : (
            <div className="tm-info-row"><span>보유 수량</span><strong>{holding ? `${fmt(holding.quantity)}주` : "0주"}</strong></div>
          )}
          <div className="tm-input-group"><label>가격</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="가격 입력"/></div>
          <div className="tm-input-group"><label>수량</label>
            <div className="tm-qty-row">
              <button onClick={()=>setQuantity(q=>Math.max(1,Number(q)-1))}>−</button>
              <input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value)||0)}/>
              <button onClick={()=>setQuantity(q=>Number(q)+1)}>+</button>
            </div>
          </div>
          <div className="tm-total"><span>총 {mode==="buy"?"매수":"매도"} 금액</span><strong>{fmt(Math.round(total))}{isDomestic(stock.market)?"원":"$"}</strong></div>
          {message && <div className={`tm-message ${message.type}`}>{message.text}</div>}
          <button className={`tm-submit ${mode}`} onClick={handleSubmit} disabled={loading||(mode==="buy"?!canBuy:!canSell)}>
            {loading ? "처리 중..." : mode==="buy" ? "매수하기" : "매도하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
