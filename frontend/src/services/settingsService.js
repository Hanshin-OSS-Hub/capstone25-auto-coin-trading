import api from "./api";

export const settingsService = {
  // 거래 설정 조회
  getTradingSettings: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  // 거래 설정 업데이트
  updateTradingSettings: async (id, settings) => {
    const response = await api.put(`/settings/${id}`, settings);
    return response.data;
  },

  // 테스트
  testConnection: async () => {
    const response = await api.get("/settings/test");
    return response.data;
  },
};
