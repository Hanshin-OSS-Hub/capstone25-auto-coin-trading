import api from './api';

export const accountService = {
  // 계좌 잔고 조회
  getAccountBalances: async () => {
    const response = await api.get('/accounts/balances');
    return response.data;
  },

  // 계좌 상태 조회
  getAccountStatus: async () => {
    const response = await api.get('/accounts/status');
    return response.data;
  },

  // 잔고 히스토리 조회
  getBalanceHistory: async (accountType, startDate, endDate) => {
    const response = await api.get('/accounts/history', {
      params: { accountType, startDate, endDate }
    });
    return response.data;
  },

  // 리밸런싱 실행
  executeRebalance: async (accountType) => {
    const response = await api.post('/accounts/rebalance', { accountType });
    return response.data;
  },

  // 리밸런싱 로그 조회
  getRebalanceLogs: async (params) => {
    const response = await api.get('/accounts/rebalance-logs', { params });
    return response.data;
  },

  // 거래 내역 조회
  getTransactions: async (params) => {
    const response = await api.get('/accounts/transactions', { params });
    return response.data;
  }
};
