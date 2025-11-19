import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { positionService } from '../services/positionService';
import { formatKRW, formatDateTime, formatPercent } from '../utils/formatters';
import './Trades.css';

export const Trades = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await positionService.getPositionHistory();
        setPositions(data);
      } catch (error) {
        console.error('Failed to fetch positions:', error);
        // 목업 데이터
        setPositions([
          {
            positionId: 1,
            coin: 'BTC',
            entryTime: '2024-01-15 10:30:00',
            exitTime: '2024-01-15 14:20:00',
            entryPremium: 2.5,
            exitPremium: 0.3,
            netProfit: 125000,
            profitRate: 2.1,
            status: 'closed'
          },
          {
            positionId: 2,
            coin: 'ETH',
            entryTime: '2024-01-15 09:15:00',
            exitTime: '2024-01-15 13:45:00',
            entryPremium: 2.8,
            exitPremium: 0.5,
            netProfit: 85000,
            profitRate: 1.9,
            status: 'closed'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  return (
    <div className="trades">
      <Card title="거래 내역" subtitle="완료된 차익거래 포지션">
        {loading ? (
          <div className="trades__loading">로딩 중...</div>
        ) : (
          <div className="trades__table-wrapper">
            <table className="trades__table">
              <thead>
                <tr>
                  <th>포지션 ID</th>
                  <th>코인</th>
                  <th>진입 시간</th>
                  <th>종료 시간</th>
                  <th className="text-right">진입 프리미엄</th>
                  <th className="text-right">종료 프리미엄</th>
                  <th className="text-right">순수익</th>
                  <th className="text-right">수익률</th>
                  <th className="text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {positions.length > 0 ? (
                  positions.map((pos) => (
                    <tr key={pos.positionId}>
                      <td>#{pos.positionId}</td>
                      <td className="trades__coin">{pos.coin}</td>
                      <td>{formatDateTime(pos.entryTime)}</td>
                      <td>{formatDateTime(pos.exitTime)}</td>
                      <td className="text-right text-success">
                        +{formatPercent(pos.entryPremium)}
                      </td>
                      <td className="text-right">
                        +{formatPercent(pos.exitPremium)}
                      </td>
                      <td className={`text-right font-bold ${
                        pos.netProfit > 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {pos.netProfit > 0 ? '+' : ''}{formatKRW(pos.netProfit)}
                      </td>
                      <td className={`text-right font-bold ${
                        pos.profitRate > 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {pos.profitRate > 0 ? '+' : ''}{formatPercent(pos.profitRate)}
                      </td>
                      <td className="text-center">
                        <span className="trades__status trades__status--closed">
                          {pos.status === 'closed' ? '완료' : '진행중'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-secondary">
                      거래 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
