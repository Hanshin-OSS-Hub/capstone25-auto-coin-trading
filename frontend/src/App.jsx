import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { Opportunities } from "./pages/Opportunities";
import { Trades } from "./pages/Trades";
import { Settings } from "./pages/Settings";
import { marketService } from "./services/marketService";
import { settingsService } from "./services/settingsService";
import CandlestickChart from "./components/chart/CandlestickChart";
import "./styles/App.css";

// 메인 앱 컴포넌트
function MainApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [prices, setPrices] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // 시세 데이터 가져오기
  const fetchPrices = async () => {
    try {
      const data = await marketService.getCurrentPrices();
      setPrices(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      // 에러 발생시 목업 데이터 사용
      setPrices(generateMockPrices());
    }
  };

  // 차익거래 기회 가져오기
  const fetchOpportunities = async () => {
    try {
      const data = await marketService.getArbitrageOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      // 에러 발생시 목업 데이터 사용
      setOpportunities(generateMockOpportunities());
    }
  };

  // 자동거래 상태 확인
  const checkAutoTradingStatus = async () => {
    try {
      const status = await settingsService.getAutoTradingStatus();
      setIsAutoTrading(status.enabled);
    } catch (error) {
      console.error("Failed to check auto trading status:", error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPrices(),
        fetchOpportunities(),
        checkAutoTradingStatus(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 실시간 업데이트 (3초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrices();
      fetchOpportunities();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchPrices();
    fetchOpportunities();
  };

  const handleToggleAutoTrading = async () => {
    try {
      const newStatus = !isAutoTrading;
      await settingsService.toggleAutoTrading(newStatus);
      setIsAutoTrading(newStatus);
    } catch (error) {
      console.error("Failed to toggle auto trading:", error);
      alert("자동거래 설정 변경에 실패했습니다.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">데이터를 불러오는 중...</div>;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard prices={prices} />;
      case "opportunities":
        return <Opportunities opportunities={opportunities} />;
      case "chart":
        return <CandlestickChart />;
      case "trades":
        return <Trades />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard prices={prices} />;
    }
  };

  return (
    <div className="app">
      <Header
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        isAutoTrading={isAutoTrading}
        onToggleAutoTrading={handleToggleAutoTrading}
      />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app__main">{renderContent()}</main>
    </div>
  );
}

// 목업 데이터 생성 함수들
const generateMockPrices = () => {
  const coins = ["BTC", "ETH", "XRP", "SOL"];
  const baseExchangeRate = 1330;

  return coins.map((coin) => {
    const usPrice =
      coin === "BTC"
        ? 103000
        : coin === "ETH"
        ? 3500
        : coin === "SOL"
        ? 180
        : 0.58;
    const convertedPrice = usPrice * baseExchangeRate;
    const domesticPrice = convertedPrice * (1 + (Math.random() * 0.04 - 0.01));
    const premium = ((domesticPrice - convertedPrice) / convertedPrice) * 100;

    return {
      coin,
      domesticPrice: Math.round(domesticPrice),
      usPrice,
      convertedPrice: Math.round(convertedPrice),
      premium: premium.toFixed(2),
    };
  });
};

const generateMockOpportunities = () => {
  return [
    {
      id: 1,
      coin: "BTC",
      buyExchange: "바이낸스",
      sellExchange: "빗썸",
      buyPrice: 137000000,
      sellPrice: 140500000,
      profitRate: 2.55,
      estimatedProfit: 175000,
      status: "active",
    },
    {
      id: 2,
      coin: "ETH",
      buyExchange: "바이낸스",
      sellExchange: "업비트",
      buyPrice: 4600000,
      sellPrice: 4720000,
      profitRate: 2.61,
      estimatedProfit: 65000,
      status: "active",
    },
  ];
};

// 루트 App 컴포넌트
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 보호된 라우트 */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainApp />
              </PrivateRoute>
            }
          />

          {/* 루트 경로 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
