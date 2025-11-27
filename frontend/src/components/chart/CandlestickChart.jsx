import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const ArbitrageCandlestickChart = () => {
  const upbitChartRef = useRef(null);
  const binanceChartRef = useRef(null);
  const upbitCandleSeriesRef = useRef(null);
  const binanceCandleSeriesRef = useRef(null);
  const upbitVolumeSeriesRef = useRef(null);
  const binanceVolumeSeriesRef = useRef(null);
  const upbitWsRef = useRef(null);
  const binanceWsRef = useRef(null);

  const [symbol, setSymbol] = useState("BTC");
  const [upbitPrice, setUpbitPrice] = useState(null);
  const [binancePrice, setBinancePrice] = useState(null);
  const [usdToKrw, setUsdToKrw] = useState(1300); // 환율 (임시)
  const [priceDiff, setPriceDiff] = useState(null);
  const [diffPercent, setDiffPercent] = useState(null);

  // 심볼 매핑
  const symbolMap = {
    BTC: { upbit: "KRW-BTC", binance: "BTCUSDT" },
    ETH: { upbit: "KRW-ETH", binance: "ETHUSDT" },
    SOL: { upbit: "KRW-SOL", binance: "SOLUSDT" },
  };

  // 차트 초기화
  useEffect(() => {
    // 업비트 차트
    if (upbitChartRef.current) {
      const upbitChart = createChart(upbitChartRef.current, {
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

      const upbitCandleSeries = upbitChart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      const upbitVolumeSeries = upbitChart.addHistogramSeries({
        color: "#26a69a",
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });

      upbitVolumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });

      upbitChartRef.current.chartInstance = upbitChart;
      upbitCandleSeriesRef.current = upbitCandleSeries;
      upbitVolumeSeriesRef.current = upbitVolumeSeries;
    }

    // 바이낸스 차트
    if (binanceChartRef.current) {
      const binanceChart = createChart(binanceChartRef.current, {
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

      const binanceCandleSeries = binanceChart.addCandlestickSeries({
        upColor: "#f0b90b",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#f0b90b",
        wickDownColor: "#ef5350",
      });

      const binanceVolumeSeries = binanceChart.addHistogramSeries({
        color: "#f0b90b",
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });

      binanceVolumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });

      binanceChartRef.current.chartInstance = binanceChart;
      binanceCandleSeriesRef.current = binanceCandleSeries;
      binanceVolumeSeriesRef.current = binanceVolumeSeries;
    }

    // 반응형 처리
    const handleResize = () => {
      if (upbitChartRef.current?.chartInstance) {
        upbitChartRef.current.chartInstance.applyOptions({
          width: upbitChartRef.current.clientWidth,
        });
      }
      if (binanceChartRef.current?.chartInstance) {
        binanceChartRef.current.chartInstance.applyOptions({
          width: binanceChartRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (upbitChartRef.current?.chartInstance) {
        upbitChartRef.current.chartInstance.remove();
      }
      if (binanceChartRef.current?.chartInstance) {
        binanceChartRef.current.chartInstance.remove();
      }
    };
  }, []);

  // 업비트 WebSocket
  useEffect(() => {
    const upbitSymbol = symbolMap[symbol].upbit;
    const upbitCandleData = {};
    const upbitVolumeData = {};
    const CANDLE_INTERVAL = 60000; // 1분

    const connectUpbit = () => {
      if (upbitWsRef.current) {
        upbitWsRef.current.close();
      }

      const ws = new WebSocket("wss://api.upbit.com/websocket/v1");
      upbitWsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify([
            { ticket: "upbit" },
            { type: "ticker", codes: [upbitSymbol] },
          ])
        );
      };

      ws.onmessage = async (event) => {
        const text = await event.data.text();
        const data = JSON.parse(text);

        if (data.type === "ticker") {
          const price = data.trade_price;
          const volume = data.acc_trade_volume_24h;
          const timestamp =
            (Math.floor(data.timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL) /
            1000;

          setUpbitPrice(price);

          if (!upbitCandleData[timestamp]) {
            upbitCandleData[timestamp] = {
              time: timestamp,
              open: price,
              high: price,
              low: price,
              close: price,
            };
            upbitVolumeData[timestamp] = {
              time: timestamp,
              value: volume,
              color:
                price >= upbitCandleData[timestamp]?.open
                  ? "#26a69a"
                  : "#ef5350",
            };
          } else {
            upbitCandleData[timestamp].high = Math.max(
              upbitCandleData[timestamp].high,
              price
            );
            upbitCandleData[timestamp].low = Math.min(
              upbitCandleData[timestamp].low,
              price
            );
            upbitCandleData[timestamp].close = price;
            upbitVolumeData[timestamp].value = volume;
            upbitVolumeData[timestamp].color =
              price >= upbitCandleData[timestamp].open ? "#26a69a" : "#ef5350";
          }

          if (upbitCandleSeriesRef.current && upbitVolumeSeriesRef.current) {
            const sortedCandles = Object.values(upbitCandleData).sort(
              (a, b) => a.time - b.time
            );
            const sortedVolumes = Object.values(upbitVolumeData).sort(
              (a, b) => a.time - b.time
            );
            upbitCandleSeriesRef.current.setData(sortedCandles);
            upbitVolumeSeriesRef.current.setData(sortedVolumes);
          }
        }
      };

      ws.onclose = () => {
        setTimeout(connectUpbit, 3000);
      };
    };

    connectUpbit();

    return () => {
      if (upbitWsRef.current) {
        upbitWsRef.current.close();
      }
    };
  }, [symbol]);

  // 바이낸스 WebSocket
  useEffect(() => {
    const binanceSymbol = symbolMap[symbol].binance.toLowerCase();
    const binanceCandleData = {};
    const binanceVolumeData = {};
    const CANDLE_INTERVAL = 60000; // 1분

    const connectBinance = () => {
      if (binanceWsRef.current) {
        binanceWsRef.current.close();
      }

      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`
      );
      binanceWsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        const volume = parseFloat(data.q);
        const timestamp =
          (Math.floor(data.T / CANDLE_INTERVAL) * CANDLE_INTERVAL) / 1000;

        setBinancePrice(price);

        if (!binanceCandleData[timestamp]) {
          binanceCandleData[timestamp] = {
            time: timestamp,
            open: price,
            high: price,
            low: price,
            close: price,
          };
          binanceVolumeData[timestamp] = {
            time: timestamp,
            value: volume,
            color:
              price >= binanceCandleData[timestamp]?.open
                ? "#f0b90b"
                : "#ef5350",
          };
        } else {
          binanceCandleData[timestamp].high = Math.max(
            binanceCandleData[timestamp].high,
            price
          );
          binanceCandleData[timestamp].low = Math.min(
            binanceCandleData[timestamp].low,
            price
          );
          binanceCandleData[timestamp].close = price;
          binanceVolumeData[timestamp].value += volume;
          binanceVolumeData[timestamp].color =
            price >= binanceCandleData[timestamp].open ? "#f0b90b" : "#ef5350";
        }

        if (binanceCandleSeriesRef.current && binanceVolumeSeriesRef.current) {
          const sortedCandles = Object.values(binanceCandleData).sort(
            (a, b) => a.time - b.time
          );
          const sortedVolumes = Object.values(binanceVolumeData).sort(
            (a, b) => a.time - b.time
          );
          binanceCandleSeriesRef.current.setData(sortedCandles);
          binanceVolumeSeriesRef.current.setData(sortedVolumes);
        }
      };

      ws.onclose = () => {
        setTimeout(connectBinance, 3000);
      };
    };

    connectBinance();

    return () => {
      if (binanceWsRef.current) {
        binanceWsRef.current.close();
      }
    };
  }, [symbol]);

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
    setSymbol(newSymbol);
    if (upbitCandleSeriesRef.current) upbitCandleSeriesRef.current.setData([]);
    if (binanceCandleSeriesRef.current)
      binanceCandleSeriesRef.current.setData([]);
    if (upbitVolumeSeriesRef.current) upbitVolumeSeriesRef.current.setData([]);
    if (binanceVolumeSeriesRef.current)
      binanceVolumeSeriesRef.current.setData([]);
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>
        🔄 차익거래 실시간 캔들차트
      </h2>

      {/* 코인 선택 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["BTC", "ETH", "SOL"].map((coin) => (
          <button
            key={coin}
            onClick={() => handleSymbolChange(coin)}
            style={{
              padding: "10px 20px",
              backgroundColor: symbol === coin ? "#26a69a" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* 가격 비교 대시보드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {/* 업비트 가격 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #26a69a",
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "5px" }}>
            🇰🇷 업비트
          </div>
          <div
            style={{ color: "#26a69a", fontSize: "24px", fontWeight: "bold" }}
          >
            {upbitPrice ? `${upbitPrice.toLocaleString()} KRW` : "연결 중..."}
          </div>
        </div>

        {/* 바이낸스 가격 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #f0b90b",
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "5px" }}>
            🌍 바이낸스
          </div>
          <div
            style={{ color: "#f0b90b", fontSize: "24px", fontWeight: "bold" }}
          >
            {binancePrice ? `$${binancePrice.toLocaleString()}` : "연결 중..."}
          </div>
          <div style={{ color: "#666", fontSize: "12px", marginTop: "5px" }}>
            ≈ {binancePrice ? (binancePrice * usdToKrw).toLocaleString() : "0"}{" "}
            KRW
          </div>
        </div>

        {/* 가격 차이 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            border: `2px solid ${diffPercent > 0 ? "#26a69a" : "#ef5350"}`,
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "5px" }}>
            💰 가격 차이
          </div>
          <div
            style={{
              color: diffPercent > 0 ? "#26a69a" : "#ef5350",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {priceDiff
              ? `${priceDiff > 0 ? "+" : ""}${priceDiff.toLocaleString()} KRW`
              : "계산 중..."}
          </div>
          <div
            style={{
              color: diffPercent > 0 ? "#26a69a" : "#ef5350",
              fontSize: "16px",
              marginTop: "5px",
            }}
          >
            {diffPercent
              ? `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(2)}%`
              : ""}
          </div>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "20px",
        }}
      >
        {/* 업비트 차트 */}
        <div>
          <h3 style={{ color: "#26a69a", marginBottom: "10px" }}>
            🇰🇷 업비트 (Upbit)
          </h3>
          <div
            ref={upbitChartRef}
            style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: "2px solid #26a69a",
            }}
          />
        </div>

        {/* 바이낸스 차트 */}
        <div>
          <h3 style={{ color: "#f0b90b", marginBottom: "10px" }}>
            🌍 바이낸스 (Binance)
          </h3>
          <div
            ref={binanceChartRef}
            style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: "2px solid #f0b90b",
            }}
          />
        </div>
      </div>

      {/* 안내 메시지 */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          color: "#888",
          fontSize: "14px",
        }}
      >
        <div>
          💡 <strong>차익거래 팁:</strong>
        </div>
        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
          <li>초록색(+): 업비트가 비쌈 → 바이낸스에서 사서 업비트에서 팔기</li>
          <li>
            빨간색(-): 바이낸스가 비쌈 → 업비트에서 사서 바이낸스에서 팔기
          </li>
          <li>거래량과 수수료를 고려하여 실제 수익 계산 필요</li>
        </ul>
      </div>
    </div>
  );
};

export default ArbitrageCandlestickChart;
