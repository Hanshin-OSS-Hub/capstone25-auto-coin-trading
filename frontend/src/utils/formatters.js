// 숫자를 한국 원화 형식으로 포맷팅
export const formatKRW = (value) => {
  if (value === null || value === undefined) return '₩0';
  return `₩${Number(value).toLocaleString('ko-KR')}`;
};

// 숫자를 미국 달러 형식으로 포맷팅
export const formatUSD = (value) => {
  if (value === null || value === undefined) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 숫자를 천 단위 구분자로 포맷팅
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// 퍼센트 포맷팅
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// 날짜 포맷팅
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 날짜 + 시간 포맷팅
export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 시간 포맷팅 (시:분:초)
export const formatTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 코인 수량 포맷팅
export const formatCoinAmount = (amount, decimals = 8) => {
  if (amount === null || amount === undefined) return '0';
  return Number(amount).toFixed(decimals);
};

// 프리미엄 포맷팅 (색상 포함)
export const formatPremium = (premium) => {
  if (premium === null || premium === undefined) return '0%';
  const value = Number(premium);
  const formatted = value.toFixed(2);
  return {
    value: `${value >= 0 ? '+' : ''}${formatted}%`,
    color: value > 0 ? 'text-success' : value < 0 ? 'text-danger' : 'text-secondary'
  };
};

// 경과 시간 계산
export const getElapsedTime = (startDate) => {
  if (!startDate) return '-';
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now - start) / 1000); // 초 단위
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 수익률 색상 클래스 반환
export const getProfitColorClass = (value) => {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-danger';
  return 'text-secondary';
};
