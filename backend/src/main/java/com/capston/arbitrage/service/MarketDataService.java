package com.capston.arbitrage.service;

import com.capston.arbitrage.dto.PriceInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 통합 마켓 데이터 서비스
 * 업비트, 바이낸스, USDT 환율 데이터를 통합하여 정확한 프리미엄 계산
 */
@Service
public class MarketDataService {

    private static final Logger log = LoggerFactory.getLogger(MarketDataService.class);

    private final UpbitService upbitService;
    private final BinanceService binanceService;
    private final ExchangeRateService exchangeRateService;

    public MarketDataService(UpbitService upbitService,
                             BinanceService binanceService,
                             ExchangeRateService exchangeRateService) {
        this.upbitService = upbitService;
        this.binanceService = binanceService;
        this.exchangeRateService = exchangeRateService;
    }

    /**
     * 비트코인 프리미엄 정보 조회 (USDT 환율 사용)
     * @return 통합 가격 정보
     */
    public PriceInfoResponse getBitcoinPriceInfo() {
        log.info("비트코인 프리미엄 정보 조회 시작 (USDT 환율 사용)");

        try {
            // 각 API에서 데이터 조회
            Double upbitPrice = upbitService.getBitcoinPrice();
            Double binancePrice = binanceService.getBitcoinPrice();
            Double usdtRate = exchangeRateService.getUsdtToKrwRate(); // USDT 환율 사용

            // 데이터 검증
            if (upbitPrice == null || binancePrice == null || usdtRate == null) {
                log.error("필수 데이터 조회 실패 - Upbit: {}, Binance: {}, USDT Rate: {}",
                        upbitPrice, binancePrice, usdtRate);
                return createErrorResponse("Failed to fetch price data");
            }

            // 응답 생성
            PriceInfoResponse response = PriceInfoResponse.builder()
                    .coinSymbol("BTC")
                    .domesticPrice(upbitPrice)
                    .domesticExchange("Upbit")
                    .internationalPrice(binancePrice)
                    .internationalExchange("Binance")
                    .exchangeRate(usdtRate) // USDT/KRW 환율
                    .timestamp(LocalDateTime.now())
                    .status("success")
                    .build();

            // 프리미엄 계산
            response.calculatePremium();

            log.info("비트코인 프리미엄 정보 조회 성공 - USDT 환율: {}, 프리미엄: {}%",
                    String.format("%.2f", usdtRate),
                    String.format("%.2f", response.getPremium()));

            return response;

        } catch (Exception e) {
            log.error("비트코인 프리미엄 정보 조회 중 오류 발생", e);
            return createErrorResponse("Error: " + e.getMessage());
        }
    }

    /**
     * 여러 코인의 프리미엄 정보 조회 (USDT 환율 사용)
     * @param symbols 코인 심볼 리스트 (예: ["BTC", "ETH"])
     * @return 각 코인의 프리미엄 정보 리스트
     */
    public List<PriceInfoResponse> getMultipleCoinsPriceInfo(List<String> symbols) {
        log.info("여러 코인 프리미엄 정보 조회 시작 - 코인: {}", symbols);

        List<PriceInfoResponse> responses = new ArrayList<>();

        // USDT 환율 한 번만 조회 (모든 코인에 동일하게 적용)
        Double usdtRate = exchangeRateService.getUsdtToKrwRate();

        if (usdtRate == null) {
            log.error("USDT 환율 조회 실패");
            return responses;
        }

        for (String symbol : symbols) {
            try {
                log.info("{} 가격 조회 시작", symbol);

                // 업비트와 바이낸스에서 가격 조회
                Double upbitPrice = upbitService.getCoinPrice(symbol);
                Double binancePrice = binanceService.getCoinPrice(symbol);

                if (upbitPrice == null || binancePrice == null) {
                    log.warn("{} 가격 조회 실패", symbol);
                    continue;
                }

                // 응답 생성
                PriceInfoResponse response = PriceInfoResponse.builder()
                        .coinSymbol(symbol)
                        .domesticPrice(upbitPrice)
                        .domesticExchange("Upbit")
                        .internationalPrice(binancePrice)
                        .internationalExchange("Binance")
                        .exchangeRate(usdtRate) // USDT/KRW 환율
                        .timestamp(LocalDateTime.now())
                        .status("success")
                        .build();

                // 프리미엄 계산
                response.calculatePremium();

                log.info("{} 프리미엄: {}%", symbol, String.format("%.2f", response.getPremium()));

                responses.add(response);

            } catch (Exception e) {
                log.error("{} 프리미엄 정보 조회 중 오류 발생: {}", symbol, e.getMessage());
            }
        }

        log.info("여러 코인 프리미엄 정보 조회 완료 - 성공: {}/{}", responses.size(), symbols.size());
        return responses;
    }

    /**
     * API 연결 상태 확인
     * @return API 상태 정보
     */
    public ApiHealthStatus checkApiHealth() {
        log.info("API 연결 상태 확인 시작");

        boolean upbitConnected = upbitService.isApiConnected();
        boolean binanceConnected = binanceService.isApiConnected();
        boolean exchangeRateConnected = exchangeRateService.isApiConnected();

        boolean allConnected = upbitConnected && binanceConnected && exchangeRateConnected;

        log.info("API 상태 - Upbit: {}, Binance: {}, USDT Rate: {}",
                upbitConnected, binanceConnected, exchangeRateConnected);

        return new ApiHealthStatus.Builder()
                .upbitConnected(upbitConnected)
                .binanceConnected(binanceConnected)
                .exchangeRateConnected(exchangeRateConnected)
                .allConnected(allConnected)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 에러 응답 생성
     */
    private PriceInfoResponse createErrorResponse(String message) {
        PriceInfoResponse response = new PriceInfoResponse();
        response.setStatus("error");
        response.setCoinSymbol("UNKNOWN");
        response.setTimestamp(LocalDateTime.now());

        log.error("에러 응답 생성: {}", message);
        return response;
    }

    /**
     * API 상태 정보 클래스
     */
    public static class ApiHealthStatus {
        private boolean upbitConnected;
        private boolean binanceConnected;
        private boolean exchangeRateConnected;
        private boolean allConnected;
        private LocalDateTime timestamp;

        // 기본 생성자
        public ApiHealthStatus() {
        }

        // Builder 패턴
        public static class Builder {
            private boolean upbitConnected;
            private boolean binanceConnected;
            private boolean exchangeRateConnected;
            private boolean allConnected;
            private LocalDateTime timestamp;

            public Builder upbitConnected(boolean upbitConnected) {
                this.upbitConnected = upbitConnected;
                return this;
            }

            public Builder binanceConnected(boolean binanceConnected) {
                this.binanceConnected = binanceConnected;
                return this;
            }

            public Builder exchangeRateConnected(boolean exchangeRateConnected) {
                this.exchangeRateConnected = exchangeRateConnected;
                return this;
            }

            public Builder allConnected(boolean allConnected) {
                this.allConnected = allConnected;
                return this;
            }

            public Builder timestamp(LocalDateTime timestamp) {
                this.timestamp = timestamp;
                return this;
            }

            public ApiHealthStatus build() {
                ApiHealthStatus status = new ApiHealthStatus();
                status.upbitConnected = this.upbitConnected;
                status.binanceConnected = this.binanceConnected;
                status.exchangeRateConnected = this.exchangeRateConnected;
                status.allConnected = this.allConnected;
                status.timestamp = this.timestamp;
                return status;
            }
        }

        // Getters
        public boolean isUpbitConnected() {
            return upbitConnected;
        }

        public boolean isBinanceConnected() {
            return binanceConnected;
        }

        public boolean isExchangeRateConnected() {
            return exchangeRateConnected;
        }

        public boolean isAllConnected() {
            return allConnected;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }
}