import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import "./CandlestickChart.css";

const CandlestickChart = () => {
  console.log("차트 컴포넌트 렌더링 시작!");

  const upbitChartRef = useRef(null);
  const binanceChartRef = useRef(null);
  const [symbol, setSymbol] = useState("BTC");
  const [upbitPrice, setUpbitPrice] = useState(null);
  const [binancePrice, setBinancePrice] = useState(null);
  const [usdToKrw] = useState(1300);
  const [priceDiff, setPriceDiff] = useState(null);
  const [diffPercent, setDiffPercent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const symbolMap = {
    BTC: { upbit: "KRW-BTC", binance: "btcusdt" },
    ETH: { upbit: "KRW-ETH", binance: "ethusdt" },
    SOL: { upbit: "KRW-SOL", binance: "solusdt" },
  };

  // 차트 초기화
  useEffect(() => {
    console.log("차트 초기화 시작");

    const initCharts = () => {
      // 업비트 차트
      if (upbitChartRef.current && !upbitChartRef.current.chart) {
        try {
          const chart = createChart(upbitChartRef.current, {
            width: upbitChartRef.current.clientWidth,
            height: 400,
            layout: {
              background: { color: "#1a1a1a" },
              textColor: "#d1d4dc",
            },
            grid: {
              vertLines: { color: "#2a2a2a" },
              horzLines: { color: "#2a2a2a" },
            },
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            },
          });

          const candleSeries = chart.addCandlestickSeries({
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
          });

          const volumeSeries = chart.addHistogramSeries({
            color: "#26a69a",
            priceFormat: { type: "volume" },
            priceScaleId: "",
          });

          volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.7, bottom: 0 },
          });

          upbitChartRef.current.chart = chart;
          upbitChartRef.current.candleSeries = candleSeries;
          upbitChartRef.current.volumeSeries = volumeSeries;

          console.log("업비트 차트 생성 완료");
        } catch (error) {
          console.error("업비트 차트 생성 실패:", error);
        }
      }

      // 바이낸스 차트
      if (binanceChartRef.current && !binanceChartRef.current.chart) {
        try {
          const chart = createChart(binanceChartRef.current, {
            width: binanceChartRef.current.clientWidth,
            height: 400,
            layout: {
              background: { color: "#1a1a1a" },
              textColor: "#d1d4dc",
            },
            grid: {
              vertLines: { color: "#2a2a2a" },
              horzLines: { color: "#2a2a2a" },
            },
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            },
          });

          const candleSeries = chart.addCandlestickSeries({
            upColor: "#f0b90b",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#f0b90b",
            wickDownColor: "#ef5350",
          });

          const volumeSeries = chart.addHistogramSeries({
            color: "#f0b90b",
            priceFormat: { type: "volume" },
            priceScaleId: "",
          });

          volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.7, bottom: 0 },
          });

          binanceChartRef.current.chart = chart;
          binanceChartRef.current.candleSeries = candleSeries;
          binanceChartRef.current.volumeSeries = volumeSeries;

          console.log("바이낸스 차트 생성 완료");
        } catch (error) {
          console.error("바이낸스 차트 생성 실패:", error);
        }
      }

      setIsLoading(false);
    };

    // DOM이 완전히 준비된 후 차트 초기화
    const timer = setTimeout(initCharts, 100);

    // 반응형 처리
    const handleResize = () => {
      if (upbitChartRef.current?.chart) {
        upbitChartRef.current.chart.applyOptions({
          width: upbitChartRef.current.clientWidth,
        });
      }
      if (binanceChartRef.current?.chart) {
        binanceChartRef.current.chart.applyOptions({
          width: binanceChartRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      if (upbitChartRef.current?.chart) {
        upbitChartRef.current.chart.remove();
        upbitChartRef.current.chart = null;
      }
      if (binanceChartRef.current?.chart) {
        binanceChartRef.current.chart.remove();
        binanceChartRef.current.chart = null;
      }
    };
  }, []);

  // 업비트 WebSocket
  useEffect(() => {
    if (isLoading) return;

    const upbitSymbol = symbolMap[symbol].upbit;
    const candleData = [];
    const volumeData = [];
    let ws = null;

    const connectUpbit = () => {
      try {
        ws = new WebSocket("wss://api.upbit.com/websocket/v1");
        console.log("업비트 WebSocket 연결 시도:", upbitSymbol);

        ws.onopen = () => {
          console.log("업비트 WebSocket 연결됨");
          ws.send(
            JSON.stringify([
              { ticket: "upbit-chart" },
              { type: "ticker", codes: [upbitSymbol] },
            ])
          );
        };

        ws.onmessage = async (event) => {
          try {
            const text = await event.data.text();
            const data = JSON.parse(text);

            if (data.type === "ticker") {
              const price = data.trade_price;
              const volume = data.acc_trade_volume_24h / 10000; // 거래량 스케일 조정
              const time = Math.floor(data.timestamp / 1000);

              setUpbitPrice(price);

              // 캔들 데이터 추가
              candleData.push({
                time: time,
                open: price,
                high: price,
                low: price,
                close: price,
              });

              // 최근 30개만 유지
              if (candleData.length > 30) {
                candleData.shift();
              }

              // 거래량 데이터 추가
              volumeData.push({
                time: time,
                value: volume,
                color: "#26a69a",
              });

              if (volumeData.length > 30) {
                volumeData.shift();
              }

              // 차트 업데이트
              if (upbitChartRef.current?.candleSeries) {
                upbitChartRef.current.candleSeries.setData([...candleData]);
              }
              if (upbitChartRef.current?.volumeSeries) {
                upbitChartRef.current.volumeSeries.setData([...volumeData]);
              }
            }
          } catch (error) {
            console.error("업비트 데이터 처리 오류:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("업비트 WebSocket 에러:", error);
        };

        ws.onclose = () => {
          console.log("업비트 WebSocket 연결 종료");
          setTimeout(connectUpbit, 3000);
        };
      } catch (error) {
        console.error("업비트 연결 오류:", error);
      }
    };

    connectUpbit();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, isLoading]);

  // 바이낸스 WebSocket
  useEffect(() => {
    if (isLoading) return;

    const binanceSymbol = symbolMap[symbol].binance;
    const candleData = [];
    const volumeData = [];
    let ws = null;

    const connectBinance = () => {
      try {
        ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`
        );
        console.log("바이낸스 WebSocket 연결 시도:", binanceSymbol);

        ws.onopen = () => {
          console.log("바이낸스 WebSocket 연결됨");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            const volume = parseFloat(data.q);
            const time = Math.floor(data.T / 1000);

            setBinancePrice(price);

            // 캔들 데이터 추가
            candleData.push({
              time: time,
              open: price,
              high: price,
              low: price,
              close: price,
            });

            if (candleData.length > 30) {
              candleData.shift();
            }

            // 거래량 데이터 추가
            volumeData.push({
              time: time,
              value: volume,
              color: "#f0b90b",
            });

            if (volumeData.length > 30) {
              volumeData.shift();
            }

            // 차트 업데이트
            if (binanceChartRef.current?.candleSeries) {
              binanceChartRef.current.candleSeries.setData([...candleData]);
            }
            if (binanceChartRef.current?.volumeSeries) {
              binanceChartRef.current.volumeSeries.setData([...volumeData]);
            }
          } catch (error) {
            console.error("바이낸스 데이터 처리 오류:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("바이낸스 WebSocket 에러:", error);
        };

        ws.onclose = () => {
          console.log("바이낸스 WebSocket 연결 종료");
          setTimeout(connectBinance, 3000);
        };
      } catch (error) {
        console.error("바이낸스 연결 오류:", error);
      }
    };

    connectBinance();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, isLoading]);

  // 가격 차이 계산
  useEffect(() => {
    if (upbitPrice && binancePrice) {
      const binancePriceKRW = binancePrice * usdToKrw;
      const diff = upbitPrice - binancePriceKRW;
      const percent = (diff / binancePriceKRW) * 100;

      setPriceDiff(diff);
      setDiffPercent(percent);
    }
  }, [upbitPrice, binancePrice, usdToKrw]);

  const handleSymbolChange = (newSymbol) => {
    console.log("코인 변경:", newSymbol);
    setSymbol(newSymbol);
    setUpbitPrice(null);
    setBinancePrice(null);
    setPriceDiff(null);
    setDiffPercent(null);
  };

  return (
    <div className="candlestick-chart">
      <h2 className="chart-title">🔄 차익거래 실시간 캔들차트</h2>

      {isLoading && <div className="loading-message">차트 로딩 중...</div>}

      {/* 코인 선택 버튼 */}
      <div className="coin-buttons">
        {["BTC", "ETH", "SOL"].map((coin) => (
          <button
            key={coin}
            onClick={() => handleSymbolChange(coin)}
            className={`coin-button ${symbol === coin ? "active" : ""}`}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* 가격 비교 대시보드 */}
      <div className="price-dashboard">
        <div className="price-card upbit-card">
          <div className="price-label">🇰🇷 업비트</div>
          <div className="price-value upbit-price">
            {upbitPrice ? `${upbitPrice.toLocaleString()} KRW` : "연결 중..."}
          </div>
        </div>

        <div className="price-card binance-card">
          <div className="price-label">🌍 바이낸스</div>
          <div className="price-value binance-price">
            {binancePrice ? `$${binancePrice.toLocaleString()}` : "연결 중..."}
          </div>
          <div className="price-converted">
            ≈ {binancePrice ? (binancePrice * usdToKrw).toLocaleString() : "0"}{" "}
            KRW
          </div>
        </div>

        <div
          className={`price-card diff-card ${
            diffPercent > 0 ? "positive" : "negative"
          }`}
        >
          <div className="price-label">💰 가격 차이</div>
          <div className="price-value diff-value">
            {priceDiff
              ? `${priceDiff > 0 ? "+" : ""}${Math.round(
                  priceDiff
                ).toLocaleString()} KRW`
              : "계산 중..."}
          </div>
          <div className="diff-percent">
            {diffPercent
              ? `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(2)}%`
              : ""}
          </div>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-subtitle upbit-subtitle">🇰🇷 업비트 (Upbit)</h3>
          <div ref={upbitChartRef} className="chart-canvas upbit-canvas" />
        </div>

        <div className="chart-container">
          <h3 className="chart-subtitle binance-subtitle">
            🌍 바이낸스 (Binance)
          </h3>
          <div ref={binanceChartRef} className="chart-canvas binance-canvas" />
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="info-box">
        <div className="info-title">💡 차익거래 팁</div>
        <ul className="info-list">
          <li>초록색(+): 업비트가 비쌈 → 바이낸스에서 사서 업비트에서 팔기</li>
          <li>
            빨간색(-): 바이낸스가 비쌈 → 업비트에서 사서 바이낸스에서 팔기
          </li>
          <li>실시간으로 최근 30개 데이터를 표시합니다</li>
        </ul>
      </div>
    </div>
  );
};

export default CandlestickChart;
