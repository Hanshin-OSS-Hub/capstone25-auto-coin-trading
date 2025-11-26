package com.capston.arbitrage.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 바이낸스 API 응답 DTO
 * API 문서: https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker
 */
public class BinanceTickerResponse {

    @JsonProperty("symbol")
    private String symbol; // 심볼 (ex. BTCUSDT)

    @JsonProperty("price")
    private String price; // 현재가 (String으로 제공됨)

    // 기본 생성자
    public BinanceTickerResponse() {
    }

    // Getters and Setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    /**
     * 가격을 Double로 반환
     */
    public Double getPriceAsDouble() {
        try {
            return Double.parseDouble(price);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}