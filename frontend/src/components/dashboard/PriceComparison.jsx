import React from 'react';
import { Card } from '../common/Card';
import { formatKRW, formatUSD, formatPercent } from '../../utils/formatters';
import './PriceComparison.css';

export const PriceComparison = ({ prices }) => {
  return (
    <Card title="실시간 시세 비교" subtitle="국내 vs 미국 거래소">
      <div className="price-comparison">
        <div className="price-comparison__table">
          <table>
            <thead>
              <tr>
                <th>코인</th>
                <th className="text-right">국내 (빗썸)</th>
                <th className="text-right">미국 (바이낸스)</th>
                <th className="text-right">환율 적용가</th>
                <th className="text-right">프리미엄</th>
              </tr>
            </thead>
            <tbody>
              {prices && prices.length > 0 ? (
                prices.map((price) => {
                  const premiumValue = parseFloat(price.premium) || 0;
                  const premiumClass = premiumValue > 0 
                    ? 'text-success' 
                    : premiumValue < 0 
                    ? 'text-danger' 
                    : 'text-secondary';

                  return (
                    <tr key={price.coin}>
                      <td className="price-comparison__coin">
                        <span className="price-comparison__coin-symbol">{price.coin}</span>
                      </td>
                      <td className="text-right price-comparison__price">
                        {formatKRW(price.domesticPrice)}
                      </td>
                      <td className="text-right price-comparison__price">
                        {formatUSD(price.usPrice)}
                      </td>
                      <td className="text-right price-comparison__price">
                        {formatKRW(price.convertedPrice)}
                      </td>
                      <td className={`text-right price-comparison__premium ${premiumClass}`}>
                        <span className="price-comparison__premium-value">
                          {premiumValue >= 0 ? '+' : ''}{formatPercent(premiumValue)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-secondary">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
