package com.capston.arbitrage.controller;

import com.capston.arbitrage.dto.PriceInfoResponse;
import com.capston.arbitrage.service.ExchangeRateService;
import com.capston.arbitrage.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 마켓 데이터 REST API 컨트롤러
 * 실시간 가격 및 프리미엄 정보 제공 (USDT 환율 사용)
 */
@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:3000")
public class MarketDataController {

    private final MarketDataService marketDataService;
    private final ExchangeRateService exchangeRateService;

    // 생성자 주입
    public MarketDataController(MarketDataService marketDataService,
                                ExchangeRateService exchangeRateService) {
        this.marketDataService = marketDataService;
        this.exchangeRateService = exchangeRateService;
    }

    /**
     * GET /api/market/bitcoin
     * 비트코인 프리미엄 정보 조회 (USDT 환율 사용)
     */
    @GetMapping("/bitcoin")
    public ResponseEntity<PriceInfoResponse> getBitcoinPrice() {
        PriceInfoResponse response = marketDataService.getBitcoinPriceInfo();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/market/prices
     * 여러 코인의 프리미엄 정보 조회
     * @param symbols 코인 심볼 (쉼표로 구분, ex. BTC,ETH)
     */
    @GetMapping("/prices")
    public ResponseEntity<List<PriceInfoResponse>> getMultiplePrices(
            @RequestParam(defaultValue = "BTC") String symbols) {
        List<String> symbolList = Arrays.asList(symbols.split(","));
        List<PriceInfoResponse> responses = marketDataService.getMultipleCoinsPriceInfo(symbolList);
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/market/exchange-rate
     * USDT/KRW 환율 조회 (실제 거래 가격)
     */
    @GetMapping("/exchange-rate")
    public ResponseEntity<ExchangeRateDto> getExchangeRate() {
        Double usdtRate = exchangeRateService.getUsdtToKrwRate();
        Double usdRate = exchangeRateService.getUsdToKrwRate();
        Double premium = exchangeRateService.getUsdtPremium();

        ExchangeRateDto dto = new ExchangeRateDto(usdtRate, usdRate, premium);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/market/usdt-rate
     * USDT/KRW 환율만 조회
     */
    @GetMapping("/usdt-rate")
    public ResponseEntity<Map<String, Double>> getUsdtRate() {
        Double usdtRate = exchangeRateService.getUsdtToKrwRate();
        Map<String, Double> response = new HashMap<>();
        response.put("usdtToKrw", usdtRate);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/market/usd-rate
     * USD/KRW 환율 조회 (참고용)
     */
    @GetMapping("/usd-rate")
    public ResponseEntity<Map<String, Double>> getUsdRate() {
        Double usdRate = exchangeRateService.getUsdToKrwRate();
        Map<String, Double> response = new HashMap<>();
        response.put("usdToKrw", usdRate);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/market/usdt-premium
     * USDT 김치 프리미엄 조회
     */
    @GetMapping("/usdt-premium")
    public ResponseEntity<Map<String, Object>> getUsdtPremium() {
        Double premium = exchangeRateService.getUsdtPremium();
        Double usdtRate = exchangeRateService.getCachedUsdtKrwRate();
        Double usdRate = exchangeRateService.getCachedUsdKrwRate();

        Map<String, Object> response = new HashMap<>();
        response.put("usdtPremium", premium);
        response.put("usdtRate", usdtRate);
        response.put("usdRate", usdRate);
        response.put("description", "USDT가 USD보다 비싸게 거래되는 프리미엄");

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/market/exchange-rate/refresh
     * USDT 환율 캐시 강제 갱신
     */
    @PostMapping("/exchange-rate/refresh")
    public ResponseEntity<String> refreshExchangeRate() {
        exchangeRateService.refreshCache();
        return ResponseEntity.ok("USDT exchange rate cache refreshed successfully");
    }

    /**
     * GET /api/market/health
     * API 연결 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<MarketDataService.ApiHealthStatus> checkApiHealth() {
        MarketDataService.ApiHealthStatus health = marketDataService.checkApiHealth();
        return ResponseEntity.ok(health);
    }

    /**
     * GET /api/market/test
     * API 테스트 엔드포인트
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Market API is working! (Using USDT/KRW rate)");
    }

    /**
     * 환율 응답 DTO (USDT와 USD 모두 포함)
     */
    public static class ExchangeRateDto {
        private Double usdtToKrw;  // 실제 거래에 사용
        private Double usdToKrw;   // 참고용
        private Double usdtPremium; // USDT 프리미엄 (%)

        // 기본 생성자
        public ExchangeRateDto() {
        }

        // 전체 생성자
        public ExchangeRateDto(Double usdtToKrw, Double usdToKrw, Double usdtPremium) {
            this.usdtToKrw = usdtToKrw;
            this.usdToKrw = usdToKrw;
            this.usdtPremium = usdtPremium;
        }

        // Getters and Setters
        public Double getUsdtToKrw() {
            return usdtToKrw;
        }

        public void setUsdtToKrw(Double usdtToKrw) {
            this.usdtToKrw = usdtToKrw;
        }

        public Double getUsdToKrw() {
            return usdToKrw;
        }

        public void setUsdToKrw(Double usdToKrw) {
            this.usdToKrw = usdToKrw;
        }

        public Double getUsdtPremium() {
            return usdtPremium;
        }

        public void setUsdtPremium(Double usdtPremium) {
            this.usdtPremium = usdtPremium;
        }
    }
}