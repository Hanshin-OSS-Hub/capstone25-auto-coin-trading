package com.capston.arbitrage.service;

import com.capston.arbitrage.dto.ExchangeRateResponse;
import com.capston.arbitrage.dto.UpbitTickerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * 환율 서비스 - USDT/KRW 실제 거래 가격 사용
 * 업비트의 USDT-KRW 쌍에서 실제 거래되는 가격을 조회
 */
@Service
public class ExchangeRateService {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateService.class);

    private final WebClient upbitWebClient;
    private final WebClient exchangeRateWebClient;

    private static final String UPBIT_USDT_ENDPOINT = "/v1/ticker?markets=KRW-USDT";
    private static final String USD_RATE_ENDPOINT = "/v6/latest/USD";
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    // 캐시용 변수
    private Double cachedUsdtKrwRate = 1350.0; // USDT/KRW 기본값
    private Double cachedUsdKrwRate = 1330.0; // USD/KRW 기본값
    private long lastUpdateTime = 0;
    private static final long CACHE_DURATION = 300000; // 5분 (USDT는 자주 변동)

    public ExchangeRateService(
            @Qualifier("upbitWebClient") WebClient upbitWebClient,
            @Qualifier("exchangeRateWebClient") WebClient exchangeRateWebClient) {
        this.upbitWebClient = upbitWebClient;
        this.exchangeRateWebClient = exchangeRateWebClient;
    }

    /**
     * USDT/KRW 환율 조회 (업비트 실제 거래 가격)
     * 차익거래에 사용할 정확한 환율
     * @return USDT 대비 KRW 가격
     */
    public Double getUsdtToKrwRate() {
        // 캐시가 유효하면 캐시된 값 반환
        if (System.currentTimeMillis() - lastUpdateTime < CACHE_DURATION) {
            log.debug("캐시된 USDT 환율 사용: {}", cachedUsdtKrwRate);
            return cachedUsdtKrwRate;
        }

        try {
            log.info("업비트 USDT/KRW 환율 조회 시작");

            UpbitTickerResponse[] responses = upbitWebClient.get()
                    .uri(UPBIT_USDT_ENDPOINT)
                    .retrieve()
                    .bodyToMono(UpbitTickerResponse[].class)
                    .timeout(TIMEOUT)
                    .block();

            if (responses != null && responses.length > 0) {
                Double usdtPrice = responses[0].getTradePrice();

                // 캐시 업데이트
                cachedUsdtKrwRate = usdtPrice;
                lastUpdateTime = System.currentTimeMillis();

                log.info("USDT/KRW 환율 조회 성공: 1 USDT = {} KRW (실제 거래 가격)", usdtPrice);
                return usdtPrice;
            }

            log.warn("USDT 환율 조회 실패 - 캐시된 값 사용");
            return cachedUsdtKrwRate;

        } catch (Exception e) {
            log.error("USDT 환율 조회 실패: {} - 캐시된 값 사용", e.getMessage());
            return cachedUsdtKrwRate;
        }
    }

    /**
     * USD/KRW 환율 조회 (참고용)
     * 실제 거래에는 사용하지 않음
     * @return USD 대비 KRW 환율
     */
    public Double getUsdToKrwRate() {
        try {
            log.info("USD/KRW 환율 조회 시작 (참고용)");

            ExchangeRateResponse response = exchangeRateWebClient.get()
                    .uri(USD_RATE_ENDPOINT)
                    .retrieve()
                    .bodyToMono(ExchangeRateResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && "success".equals(response.getResult())) {
                Double krwRate = response.getKrwRate();
                cachedUsdKrwRate = krwRate;

                log.info("USD/KRW 환율 조회 성공: 1 USD = {} KRW (참고용)", krwRate);
                return krwRate;
            }

            log.warn("USD 환율 API 응답이 올바르지 않음");
            return cachedUsdKrwRate;

        } catch (Exception e) {
            log.error("USD 환율 API 호출 실패: {}", e.getMessage());
            return cachedUsdKrwRate;
        }
    }

    /**
     * 전체 환율 정보 조회
     * @return 환율 응답 객체
     */
    public ExchangeRateResponse getAllRates() {
        try {
            log.info("전체 환율 정보 조회 시작");

            ExchangeRateResponse response = exchangeRateWebClient.get()
                    .uri(USD_RATE_ENDPOINT)
                    .retrieve()
                    .bodyToMono(ExchangeRateResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && "success".equals(response.getResult())) {
                log.info("전체 환율 정보 조회 성공");
                cachedUsdKrwRate = response.getKrwRate();
                return response;
            }

            log.warn("전체 환율 정보 응답이 올바르지 않음");
            return null;

        } catch (Exception e) {
            log.error("전체 환율 정보 조회 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * API 연결 상태 확인
     * @return 연결 성공 여부
     */
    public boolean isApiConnected() {
        try {
            Double rate = getUsdtToKrwRate();
            return rate != null && rate > 0;
        } catch (Exception e) {
            log.error("환율 API 연결 확인 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 캐시 강제 갱신
     */
    public void refreshCache() {
        lastUpdateTime = 0;
        getUsdtToKrwRate();
        log.info("USDT 환율 캐시 강제 갱신 완료");
    }

    /**
     * 캐시된 USDT 환율 조회 (API 호출 없음)
     * @return 캐시된 USDT/KRW 환율
     */
    public Double getCachedUsdtKrwRate() {
        return cachedUsdtKrwRate;
    }

    /**
     * 캐시된 USD 환율 조회 (API 호출 없음)
     * @return 캐시된 USD/KRW 환율
     */
    public Double getCachedUsdKrwRate() {
        return cachedUsdKrwRate;
    }

    /**
     * USDT와 USD 환율 차이 (김치 프리미엄) 계산
     * @return USDT 프리미엄 (%)
     */
    public Double getUsdtPremium() {
        Double usdtRate = getUsdtToKrwRate();
        Double usdRate = getUsdToKrwRate();

        if (usdtRate != null && usdRate != null && usdRate > 0) {
            double premium = ((usdtRate / usdRate) - 1) * 100;
            log.info("USDT 김치 프리미엄: {}%", String.format("%.2f", premium));
            return premium;
        }

        return 0.0;
    }
}