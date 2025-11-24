import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Activity, Wallet } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { PriceComparison } from '../components/dashboard/PriceComparison';
import { accountService } from '../services/accountService';
import { positionService } from '../services/positionService';
import './Dashboard.css';

export const Dashboard = ({ prices }) => {
  const [stats, setStats] = useState({
    todayProfit: 0,
    totalProfit: 0,
    activeOpportunities: 0,
    completedTrades: 0,
    avgProfitRate: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 통계 데이터 가져오기
        const [accountStatus, positionStats] = await Promise.all([
          accountService.getAccountStatus(),
          positionService.getPositionStats()
        ]);

        setStats({
          todayProfit: accountStatus.todayProfit || 0,
          totalProfit: accountStatus.totalProfit || 0,
          activeOpportunities: positionStats.activeCount || 0,
          completedTrades: positionStats.todayCompleted || 0,
          avgProfitRate: positionStats.avgProfitRate || 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // 에러시 기본값 유지
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <StatCard
          title="오늘 총 수익"
          value={`₩${stats.todayProfit.toLocaleString()}`}
          change={2.5}
          icon={DollarSign}
          color="#10b981"
        />
        <StatCard
          title="누적 수익"
          value={`₩${stats.totalProfit.toLocaleString()}`}
          icon={Wallet}
          color="#8b5cf6"
        />
        <StatCard
          title="활성 기회"
          value={stats.activeOpportunities.toString()}
          icon={TrendingUp}
          color="#3b82f6"
        />
        <StatCard
          title="오늘 거래 완료"
          value={stats.completedTrades.toString()}
          change={12.3}
          icon={Activity}
          color="#f59e0b"
        />
      </div>

      <div className="dashboard__content">
        <PriceComparison prices={prices} />
      </div>
    </div>
  );
};
