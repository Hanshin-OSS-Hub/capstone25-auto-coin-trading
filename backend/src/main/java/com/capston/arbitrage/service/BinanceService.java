package com.capston.arbitrage.service;

import com.capston.arbitrage.dto.BinanceTickerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * 바이낸스 거래소 API 서비스
 */
@Service
public class BinanceService {

    private static final Logger log = LoggerFactory.getLogger(BinanceService.class);

    private final WebClient binanceWebClient;

    private static final String TICKER_PRICE_ENDPOINT = "/api/v3/ticker/price";
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    public BinanceService(@Qualifier("binanceWebClient") WebClient binanceWebClient) {
        this.binanceWebClient = binanceWebClient;
    }

    /**
     * 비트코인 현재가 조회 (USDT 기준)
     * @return 바이낸스 BTC/USDT 현재가
     */
    public Double getBitcoinPrice() {
        return getPrice("BTCUSDT");
    }

    /**
     * 코인 심볼로 현재가 조회 (USDT 기준)
     * @param symbol 코인 심볼 (ex. BTC, ETH, XRP)
     * @return 현재가 (USDT)
     */
    public Double getCoinPrice(String symbol) {
        String tradingPair = symbol + "USDT";
        return getPrice(tradingPair);
    }

    /**
     * 특정 코인의 현재가 조회
     * @param symbol 심볼 (ex. BTCUSDT, ETHUSDT)
     * @return 현재가 (USDT)
     */
    public Double getPrice(String symbol) {
        try {
            log.info("바이낸스 API 호출 시작: {}", symbol);

            BinanceTickerResponse response = binanceWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(TICKER_PRICE_ENDPOINT)
                            .queryParam("symbol", symbol)
                            .build())
                    .retrieve()
                    .bodyToMono(BinanceTickerResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response != null) {
                Double price = response.getPriceAsDouble();
                log.info("바이낸스 {} 가격 조회 성공: {}", symbol, price);
                return price;
            }

            log.warn("바이낸스 API 응답이 비어있음: {}", symbol);
            return null;

        } catch (Exception e) {
            log.error("바이낸스 API 호출 실패: {} - {}", symbol, e.getMessage());
            return null;
        }
    }

    /**
     * 비트코인 상세 정보 조회
     * @return 바이낸스 티커 정보
     */
    public BinanceTickerResponse getBitcoinTickerInfo() {
        return getTickerInfo("BTCUSDT");
    }

    /**
     * 특정 코인의 상세 정보 조회
     * @param symbol 심볼
     * @return 티커 정보
     */
    public BinanceTickerResponse getTickerInfo(String symbol) {
        try {
            log.info("바이낸스 티커 정보 조회 시작: {}", symbol);

            BinanceTickerResponse response = binanceWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(TICKER_PRICE_ENDPOINT)
                            .queryParam("symbol", symbol)
                            .build())
                    .retrieve()
                    .bodyToMono(BinanceTickerResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response != null) {
                log.info("바이낸스 {} 티커 정보 조회 성공", symbol);
                return response;
            }

            log.warn("바이낸스 티커 정보 응답이 비어있음: {}", symbol);
            return null;

        } catch (Exception e) {
            log.error("바이낸스 티커 정보 조회 실패: {} - {}", symbol, e.getMessage());
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
            log.error("바이낸스 API 연결 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}