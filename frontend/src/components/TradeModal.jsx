// src/components/TradeModal.jsx
import { useState, useEffect } from "react";
import { buyStock, sellStock, getBalance, getHoldings, isDomestic, fmt, fmtPrice } from "../api/stockApi";
import "./TradeModal.css";

export default function TradeModal({ stock, initialMode = "buy", onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [holding, setHolding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (stock?.price) setPrice(String(stock.price).replace(/[+]/g, ""));
    setQuantity(1);
    setMessage(null);
    fetchUserData();
  }, [stock]);

  const fetchUserData = async () => {
    try {
      const [bal, holdings] = await Promise.all([getBalance(), getHoldings()]);
      setBalance(bal);
      setHolding(holdings.find(x => x.symbol === stock.symbol) || null);
    } catch (e) { console.warn("잔고 조회 실패:", e); }
  };

  const numPrice = Number(price) || 0;
  const numQty = Number(quantity) || 0;
  const total = numPrice * numQty;
  const dom = isDomestic(stock?.market);
  const unit = dom ? "원" : "$";

  // 매수 계산
  const canBuy = total > 0 && total <= balance && numQty > 0;
  const currentAvgPrice = holding?.avgPrice || 0;
  const currentQty = holding?.quantity || 0;
  const newTotalCost = (currentAvgPrice * currentQty) + total;
  const newTotalQty = currentQty + numQty;
  const expectedAvgPrice = newTotalQty > 0 ? newTotalCost / newTotalQty : numPrice;

  // 매도 계산
  const canSell = holding && numQty <= holding.quantity && numQty > 0 && numPrice > 0;
  const sellRevenue = total;
  const sellCost = currentAvgPrice * numQty;
  const expectedProfit = sellRevenue - sellCost;
  const expectedProfitRate = sellCost > 0 ? ((expectedProfit / sellCost) * 100).toFixed(2) : "0.00";
  const remainQty = currentQty - numQty;

  const handleSubmit = async () => {
    setLoading(true); setMessage(null);
    try {
      const payload = {
        symbol: stock.symbol, name: stock.name, market: stock.market,
        type: mode === "buy" ? "BUY" : "SELL",
        quantity: numQty, price: numPrice,
      };
      if (mode === "buy") await buyStock(payload);
      else await sellStock(payload);
      setMessage({ type: "success", text: mode === "buy" ? "매수 완료!" : "매도 완료!" });
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
        {/* 헤더 */}
        <div className="trade-modal-hd">
          <div>
            <h3>{stock.name}</h3>
            <span className="tm-symbol">{stock.symbol} · {stock.market}</span>
          </div>
          <button className="tm-close" onClick={onClose}>✕</button>
        </div>

        {/* 탭 */}
        <div className="trade-modal-tabs">
          <button className={`tm-tab buy ${mode === "buy" ? "active" : ""}`} onClick={() => { setMode("buy"); setMessage(null); }}>매수</button>
          <button className={`tm-tab sell ${mode === "sell" ? "active" : ""}`} onClick={() => { setMode("sell"); setMessage(null); }}>매도</button>
        </div>

        <div className="trade-modal-body">
          {/* 현재가 */}
          <div className="tm-info-row">
            <span>현재가</span>
            <strong>{fmtPrice(stock.price, stock.market)}</strong>
          </div>

          {mode === "buy" ? (
            <>
              <div className="tm-info-row">
                <span>주문 가능 금액</span>
                <strong>{fmt(Math.round(balance))}{unit}</strong>
              </div>
              {holding && (
                <>
                  <div className="tm-info-row dim">
                    <span>현재 보유</span>
                    <strong>{fmt(currentQty)}주 (평단 {fmtPrice(currentAvgPrice, stock.market)})</strong>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="tm-info-row">
                <span>보유 수량</span>
                <strong>{holding ? `${fmt(holding.quantity)}주` : "0주"}</strong>
              </div>
              {holding && (
                <div className="tm-info-row dim">
                  <span>평균 매수가</span>
                  <strong>{fmtPrice(currentAvgPrice, stock.market)}</strong>
                </div>
              )}
            </>
          )}

          {/* 가격 입력 */}
          <div className="tm-input-group">
            <label>가격</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="가격 입력" />
          </div>

          {/* 수량 입력 */}
          <div className="tm-input-group">
            <label>수량</label>
            <div className="tm-qty-row">
              <button onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}>−</button>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} />
              <button onClick={() => setQuantity(q => Number(q) + 1)}>+</button>
            </div>
            {mode === "sell" && holding && (
              <div className="tm-qty-shortcuts">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setQuantity(Math.floor(holding.quantity * pct / 100))}>{pct}%</button>
                ))}
              </div>
            )}
          </div>

          {/* 총 금액 */}
          <div className="tm-total">
            <span>총 {mode === "buy" ? "매수" : "매도"} 금액</span>
            <strong>{fmt(Math.round(total))}{unit}</strong>
          </div>

          {/* 매수 시: 예상 평단가 */}
          {mode === "buy" && numQty > 0 && numPrice > 0 && (
            <div className="tm-estimate">
              <div className="tm-est-row">
                <span>구매 후 예상 평단가</span>
                <strong>{dom ? `${fmt(Math.round(expectedAvgPrice))}원` : `$${expectedAvgPrice.toFixed(2)}`}</strong>
              </div>
              <div className="tm-est-row">
                <span>구매 후 총 보유</span>
                <strong>{fmt(newTotalQty)}주</strong>
              </div>
              {holding && currentAvgPrice > 0 && (
                <div className="tm-est-row">
                  <span>평단가 변화</span>
                  <strong className={expectedAvgPrice <= currentAvgPrice ? "down-text" : "up-text"}>
                    {fmtPrice(currentAvgPrice, stock.market)} → {dom ? `${fmt(Math.round(expectedAvgPrice))}원` : `$${expectedAvgPrice.toFixed(2)}`}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* 매도 시: 예상 수익 */}
          {mode === "sell" && holding && numQty > 0 && numPrice > 0 && (
            <div className="tm-estimate">
              <div className="tm-est-row">
                <span>매수 금액 (평단 기준)</span>
                <strong>{fmt(Math.round(sellCost))}{unit}</strong>
              </div>
              <div className="tm-est-row">
                <span>매도 금액</span>
                <strong>{fmt(Math.round(sellRevenue))}{unit}</strong>
              </div>
              <div className={`tm-est-row highlight ${expectedProfit >= 0 ? "profit" : "loss"}`}>
                <span>예상 수익</span>
                <strong>
                  {expectedProfit >= 0 ? "+" : ""}{fmt(Math.round(expectedProfit))}{unit}
                  <small> ({expectedProfitRate}%)</small>
                </strong>
              </div>
              {remainQty > 0 && (
                <div className="tm-est-row">
                  <span>매도 후 잔여</span>
                  <strong>{fmt(remainQty)}주</strong>
                </div>
              )}
            </div>
          )}

          {/* 메시지 */}
          {message && <div className={`tm-message ${message.type}`}>{message.text}</div>}

          {/* 주문 버튼 */}
          <button
            className={`tm-submit ${mode}`}
            onClick={handleSubmit}
            disabled={loading || (mode === "buy" ? !canBuy : !canSell)}
          >
            {loading ? "처리 중..." : mode === "buy" ? "매수하기" : "매도하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
