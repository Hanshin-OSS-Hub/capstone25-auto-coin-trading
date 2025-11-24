import React from "react";
import { Card } from "../components/common/Card";
import { formatKRW, formatPercent } from "../utils/formatters"; //formatNumber,
import "./Opportunities.css";

export const Opportunities = ({ opportunities }) => {
  return (
    <div className="opportunities">
      <Card
        title="실시간 차익거래 기회"
        subtitle="최소 수익률 0.5% 이상 기회만 표시"
      >
        <div className="opportunities__table-wrapper">
          <table className="opportunities__table">
            <thead>
              <tr>
                <th>코인</th>
                <th>매수 거래소</th>
                <th>매도 거래소</th>
                <th className="text-right">매수가</th>
                <th className="text-right">매도가</th>
                <th className="text-right">수익률</th>
                <th className="text-right">예상 수익</th>
                <th className="text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {opportunities && opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td className="opportunities__coin">{opp.coin}</td>
                    <td className="opportunities__buy-exchange">
                      {opp.buyExchange}
                    </td>
                    <td className="opportunities__sell-exchange">
                      {opp.sellExchange}
                    </td>
                    <td className="text-right">{formatKRW(opp.buyPrice)}</td>
                    <td className="text-right">{formatKRW(opp.sellPrice)}</td>
                    <td className="text-right">
                      <span className="opportunities__profit-rate text-success">
                        +{formatPercent(opp.profitRate)}
                      </span>
                    </td>
                    <td className="text-right opportunities__profit text-success">
                      +{formatKRW(opp.estimatedProfit)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`opportunities__status ${
                          opp.status === "active"
                            ? "opportunities__status--active"
                            : "opportunities__status--expired"
                        }`}
                      >
                        {opp.status === "active" ? "활성" : "만료"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-secondary">
                    현재 차익거래 기회가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
