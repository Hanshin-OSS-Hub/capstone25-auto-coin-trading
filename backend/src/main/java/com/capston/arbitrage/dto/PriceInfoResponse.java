package com.capston.arbitrage.dto;

import java.time.LocalDateTime;

/**
 * 통합 가격 정보 DTO
 * 프론트엔드로 전달할 데이터 구조
 */
public class PriceInfoResponse {

    private String coinSymbol; // 코인 심볼 (BTC, ETH 등)

    // 국내 거래소 (업비트)
    private Double domesticPrice; // 국내 가격 (KRW)
    private String domesticExchange; // 거래소 이름

    // 해외 거래소 (바이낸스)
    private Double internationalPrice; // 해외 가격 (USDT)
    private String internationalExchange; // 거래소 이름

    // 환율
    private Double exchangeRate; // USD/KRW 환율

    // 계산된 값
    private Double internationalPriceInKrw; // 해외 가격을 원화로 환산
    private Double premium; // 프리미엄 (%)
    private Double priceDifference; // 가격 차이 (원화)

    // 메타 정보
    private LocalDateTime timestamp; // 조회 시각
    private String status; // success, error

    // 기본 생성자
    public PriceInfoResponse() {
    }

    // Builder 패턴을 위한 정적 메서드
    public static Builder builder() {
        return new Builder();
    }

    // Builder 클래스
    public static class Builder {
        private String coinSymbol;
        private Double domesticPrice;
        private String domesticExchange;
        private Double internationalPrice;
        private String internationalExchange;
        private Double exchangeRate;
        private LocalDateTime timestamp;
        private String status;

        public Builder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public Builder domesticPrice(Double domesticPrice) {
            this.domesticPrice = domesticPrice;
            return this;
        }

        public Builder domesticExchange(String domesticExchange) {
            this.domesticExchange = domesticExchange;
            return this;
        }

        public Builder internationalPrice(Double internationalPrice) {
            this.internationalPrice = internationalPrice;
            return this;
        }

        public Builder internationalExchange(String internationalExchange) {
            this.internationalExchange = internationalExchange;
            return this;
        }

        public Builder exchangeRate(Double exchangeRate) {
            this.exchangeRate = exchangeRate;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public PriceInfoResponse build() {
            PriceInfoResponse response = new PriceInfoResponse();
            response.coinSymbol = this.coinSymbol;
            response.domesticPrice = this.domesticPrice;
            response.domesticExchange = this.domesticExchange;
            response.internationalPrice = this.internationalPrice;
            response.internationalExchange = this.internationalExchange;
            response.exchangeRate = this.exchangeRate;
            response.timestamp = this.timestamp;
            response.status = this.status;
            return response;
        }
    }

    /**
     * 프리미엄 계산
     * 프리미엄 = (국내가격 / 해외가격(원화환산) - 1) * 100
     */
    public void calculatePremium() {
        if (domesticPrice != null && internationalPrice != null && exchangeRate != null) {
            this.internationalPriceInKrw = internationalPrice * exchangeRate;
            this.premium = ((domesticPrice / internationalPriceInKrw) - 1) * 100;
            this.priceDifference = domesticPrice - internationalPriceInKrw;
        }
    }

    // Getters and Setters
    public String getCoinSymbol() {
        return coinSymbol;
    }

    public void setCoinSymbol(String coinSymbol) {
        this.coinSymbol = coinSymbol;
    }

    public Double getDomesticPrice() {
        return domesticPrice;
    }

    public void setDomesticPrice(Double domesticPrice) {
        this.domesticPrice = domesticPrice;
    }

    public String getDomesticExchange() {
        return domesticExchange;
    }

    public void setDomesticExchange(String domesticExchange) {
        this.domesticExchange = domesticExchange;
    }

    public Double getInternationalPrice() {
        return internationalPrice;
    }

    public void setInternationalPrice(Double internationalPrice) {
        this.internationalPrice = internationalPrice;
    }

    public String getInternationalExchange() {
        return internationalExchange;
    }

    public void setInternationalExchange(String internationalExchange) {
        this.internationalExchange = internationalExchange;
    }

    public Double getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(Double exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public Double getInternationalPriceInKrw() {
        return internationalPriceInKrw;
    }

    public void setInternationalPriceInKrw(Double internationalPriceInKrw) {
        this.internationalPriceInKrw = internationalPriceInKrw;
    }

    public Double getPremium() {
        return premium;
    }

    public void setPremium(Double premium) {
        this.premium = premium;
    }

    public Double getPriceDifference() {
        return priceDifference;
    }

    public void setPriceDifference(Double priceDifference) {
        this.priceDifference = priceDifference;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}