import api from './api';

export const positionService = {
  // 열린 포지션 조회
  getOpenPositions: async () => {
    const response = await api.get('/positions/open');
    return response.data;
  },

  // 특정 포지션 조회
  getPositionById: async (positionId) => {
    const response = await api.get(`/positions/${positionId}`);
    return response.data;
  },

  // 포지션 오픈
  openPosition: async (positionData) => {
    const response = await api.post('/positions/open', positionData);
    return response.data;
  },

  // 포지션 종료
  closePosition: async (positionId, closeData) => {
    const response = await api.post(`/positions/${positionId}/close`, closeData);
    return response.data;
  },

  // 포지션 히스토리 조회
  getPositionHistory: async (params) => {
    const response = await api.get('/positions/history', { params });
    return response.data;
  },

  // 포지션 통계
  getPositionStats: async (startDate, endDate) => {
    const response = await api.get('/positions/stats', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
