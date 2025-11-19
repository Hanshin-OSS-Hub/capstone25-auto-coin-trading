import api from "./api";

export const marketService = {
  // 현재 시세 조회
  getCurrentPrices: async () => {
    const response = await api.get("/market/prices");
    return response.data;
  },

  // 프리미엄 정보 조회
  getPremiumInfo: async (coin) => {
    const response = await api.get(`/market/premium/${coin}`);
    return response.data;
  },

  // 시장 스냅샷 조회
  getMarketSnapshots: async (coin, startDate, endDate) => {
    const response = await api.get("/market/snapshots", {
      params: { coin, startDate, endDate },
    });
    return response.data;
  },

  // 차익거래 기회 조회
  getArbitrageOpportunities: async () => {
    const response = await api.get("/market/opportunities");
    return response.data;
  },

  // // 실시간 시세 웹소켓 연결 (나중에 구현)
  // subscribeToMarketData: (onMessage) => {
  //   // WebSocket 구현
  // }
};
