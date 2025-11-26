package com.capston.arbitrage.service;

import com.capston.arbitrage.dto.UpbitTickerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * 업비트 거래소 API 서비스
 */
@Service
public class UpbitService {

    private static final Logger log = LoggerFactory.getLogger(UpbitService.class);

    private final WebClient upbitWebClient;

    private static final String TICKER_ENDPOINT = "/v1/ticker";
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    public UpbitService(@Qualifier("upbitWebClient") WebClient upbitWebClient) {
        this.upbitWebClient = upbitWebClient;
    }

    /**
     * 비트코인 현재가 조회
     * @return 업비트 BTC/KRW 현재가
     */
    public Double getBitcoinPrice() {
        return getPrice("KRW-BTC");
    }

    /**
     * 코인 심볼로 현재가 조회
     * @param symbol 코인 심볼 (ex. BTC, ETH, XRP)
     * @return 현재가
     */
    public Double getCoinPrice(String symbol) {
        String market = "KRW-" + symbol;
        return getPrice(market);
    }

    /**
     * 특정 코인의 현재가 조회
     * @param market 마켓 코드 (ex. KRW-BTC, KRW-ETH)
     * @return 현재가
     */
    public Double getPrice(String market) {
        try {
            log.info("업비트 API 호출 시작: {}", market);

            UpbitTickerResponse[] responses = upbitWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(TICKER_ENDPOINT)
                            .queryParam("markets", market)
                            .build())
                    .retrieve()
                    .bodyToMono(UpbitTickerResponse[].class)
                    .timeout(TIMEOUT)
                    .block();

            if (responses != null && responses.length > 0) {
                Double price = responses[0].getTradePrice();
                log.info("업비트 {} 가격 조회 성공: {}", market, price);
                return price;
            }

            log.warn("업비트 API 응답이 비어있음: {}", market);
            return null;

        } catch (Exception e) {
            log.error("업비트 API 호출 실패: {} - {}", market, e.getMessage());
            return null;
        }
    }

    /**
     * 비트코인 상세 정보 조회
     * @return 업비트 티커 정보
     */
    public UpbitTickerResponse getBitcoinTickerInfo() {
        return getTickerInfo("KRW-BTC");
    }

    /**
     * 특정 코인의 상세 정보 조회
     * @param market 마켓 코드
     * @return 티커 정보
     */
    public UpbitTickerResponse getTickerInfo(String market) {
        try {
            log.info("업비트 티커 정보 조회 시작: {}", market);

            UpbitTickerResponse[] responses = upbitWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(TICKER_ENDPOINT)
                            .queryParam("markets", market)
                            .build())
                    .retrieve()
                    .bodyToMono(UpbitTickerResponse[].class)
                    .timeout(TIMEOUT)
                    .block();

            if (responses != null && responses.length > 0) {
                log.info("업비트 {} 티커 정보 조회 성공", market);
                return responses[0];
            }

            log.warn("업비트 티커 정보 응답이 비어있음: {}", market);
            return null;

        } catch (Exception e) {
            log.error("업비트 티커 정보 조회 실패: {} - {}", market, e.getMessage());
            return null;
        }
    }

    /**
     * API 연결 상태 확인
     * @return 연결 성공 여부
     */
    public boolean isApiConnected() {
        try {
            Double price = getBitcoinPrice();
            return price != null && price > 0;
        } catch (Exception e) {
            log.error("업비트 API 연결 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}