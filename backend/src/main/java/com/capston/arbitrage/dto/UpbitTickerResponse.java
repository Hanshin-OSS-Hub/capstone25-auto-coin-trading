package com.capston.arbitrage.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 업비트 API 응답 DTO
 * API 문서: https://docs.upbit.com/reference/ticker%ED%98%84%EC%9E%AC%EA%B0%80-%EB%82%B4%EC%97%AD
 */
public class UpbitTickerResponse {

    @JsonProperty("market")
    private String market; // 마켓 코드 (ex. KRW-BTC)

    @JsonProperty("trade_date")
    private String tradeDate; // 최근 거래 일자(UTC)

    @JsonProperty("trade_time")
    private String tradeTime; // 최근 거래 시각(UTC)

    @JsonProperty("trade_date_kst")
    private String tradeDateKst; // 최근 거래 일자(KST)

    @JsonProperty("trade_time_kst")
    private String tradeTimeKst; // 최근 거래 시각(KST)

    @JsonProperty("trade_timestamp")
    private Long tradeTimestamp; // 체결 타임스탬프 (밀리초)

    @JsonProperty("opening_price")
    private Double openingPrice; // 시가

    @JsonProperty("high_price")
    private Double highPrice; // 고가

    @JsonProperty("low_price")
    private Double lowPrice; // 저가

    @JsonProperty("trade_price")
    private Double tradePrice; // 현재가

    @JsonProperty("prev_closing_price")
    private Double prevClosingPrice; // 전일 종가

    @JsonProperty("change")
    private String change; // RISE, EVEN, FALL

    @JsonProperty("change_price")
    private Double changePrice; // 전일 대비 변화 금액

    @JsonProperty("change_rate")
    private Double changeRate; // 전일 대비 변화율

    @JsonProperty("signed_change_price")
    private Double signedChangePrice; // 부호가 있는 변화 금액

    @JsonProperty("signed_change_rate")
    private Double signedChangeRate; // 부호가 있는 변화율

    @JsonProperty("trade_volume")
    private Double tradeVolume; // 가장 최근 거래량

    @JsonProperty("acc_trade_price")
    private Double accTradePrice; // 누적 거래대금 (UTC 0시 기준)

    @JsonProperty("acc_trade_price_24h")
    private Double accTradePrice24h; // 24시간 누적 거래대금

    @JsonProperty("acc_trade_volume")
    private Double accTradeVolume; // 누적 거래량 (UTC 0시 기준)

    @JsonProperty("acc_trade_volume_24h")
    private Double accTradeVolume24h; // 24시간 누적 거래량

    @JsonProperty("highest_52_week_price")
    private Double highest52WeekPrice; // 52주 최고가

    @JsonProperty("highest_52_week_date")
    private String highest52WeekDate; // 52주 최고가 달성일

    @JsonProperty("lowest_52_week_price")
    private Double lowest52WeekPrice; // 52주 최저가

    @JsonProperty("lowest_52_week_date")
    private String lowest52WeekDate; // 52주 최저가 달성일

    @JsonProperty("timestamp")
    private Long timestamp; // 타임스탬프

    // 기본 생성자
    public UpbitTickerResponse() {
    }

    // Getters and Setters
    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getTradeDate() {
        return tradeDate;
    }

    public void setTradeDate(String tradeDate) {
        this.tradeDate = tradeDate;
    }

    public String getTradeTime() {
        return tradeTime;
    }

    public void setTradeTime(String tradeTime) {
        this.tradeTime = tradeTime;
    }

    public String getTradeDateKst() {
        return tradeDateKst;
    }

    public void setTradeDateKst(String tradeDateKst) {
        this.tradeDateKst = tradeDateKst;
    }

    public String getTradeTimeKst() {
        return tradeTimeKst;
    }

    public void setTradeTimeKst(String tradeTimeKst) {
        this.tradeTimeKst = tradeTimeKst;
    }

    public Long getTradeTimestamp() {
        return tradeTimestamp;
    }

    public void setTradeTimestamp(Long tradeTimestamp) {
        this.tradeTimestamp = tradeTimestamp;
    }

    public Double getOpeningPrice() {
        return openingPrice;
    }

    public void setOpeningPrice(Double openingPrice) {
        this.openingPrice = openingPrice;
    }

    public Double getHighPrice() {
        return highPrice;
    }

    public void setHighPrice(Double highPrice) {
        this.highPrice = highPrice;
    }

    public Double getLowPrice() {
        return lowPrice;
    }

    public void setLowPrice(Double lowPrice) {
        this.lowPrice = lowPrice;
    }

    public Double getTradePrice() {
        return tradePrice;
    }

    public void setTradePrice(Double tradePrice) {
        this.tradePrice = tradePrice;
    }

    public Double getPrevClosingPrice() {
        return prevClosingPrice;
    }

    public void setPrevClosingPrice(Double prevClosingPrice) {
        this.prevClosingPrice = prevClosingPrice;
    }

    public String getChange() {
        return change;
    }

    public void setChange(String change) {
        this.change = change;
    }

    public Double getChangePrice() {
        return changePrice;
    }

    public void setChangePrice(Double changePrice) {
        this.changePrice = changePrice;
    }

    public Double getChangeRate() {
        return changeRate;
    }

    public void setChangeRate(Double changeRate) {
        this.changeRate = changeRate;
    }

    public Double getSignedChangePrice() {
        return signedChangePrice;
    }

    public void setSignedChangePrice(Double signedChangePrice) {
        this.signedChangePrice = signedChangePrice;
    }

    public Double getSignedChangeRate() {
        return signedChangeRate;
    }

    public void setSignedChangeRate(Double signedChangeRate) {
        this.signedChangeRate = signedChangeRate;
    }

    public Double getTradeVolume() {
        return tradeVolume;
    }

    public void setTradeVolume(Double tradeVolume) {
        this.tradeVolume = tradeVolume;
    }

    public Double getAccTradePrice() {
        return accTradePrice;
    }

    public void setAccTradePrice(Double accTradePrice) {
        this.accTradePrice = accTradePrice;
    }

    public Double getAccTradePrice24h() {
        return accTradePrice24h;
    }

    public void setAccTradePrice24h(Double accTradePrice24h) {
        this.accTradePrice24h = accTradePrice24h;
    }

    public Double getAccTradeVolume() {
        return accTradeVolume;
    }

    public void setAccTradeVolume(Double accTradeVolume) {
        this.accTradeVolume = accTradeVolume;
    }

    public Double getAccTradeVolume24h() {
        return accTradeVolume24h;
    }

    public void setAccTradeVolume24h(Double accTradeVolume24h) {
        this.accTradeVolume24h = accTradeVolume24h;
    }

    public Double getHighest52WeekPrice() {
        return highest52WeekPrice;
    }

    public void setHighest52WeekPrice(Double highest52WeekPrice) {
        this.highest52WeekPrice = highest52WeekPrice;
    }

    public String getHighest52WeekDate() {
        return highest52WeekDate;
    }

    public void setHighest52WeekDate(String highest52WeekDate) {
        this.highest52WeekDate = highest52WeekDate;
    }

    public Double getLowest52WeekPrice() {
        return lowest52WeekPrice;
    }

    public void setLowest52WeekPrice(Double lowest52WeekPrice) {
        this.lowest52WeekPrice = lowest52WeekPrice;
    }

    public String getLowest52WeekDate() {
        return lowest52WeekDate;
    }

    public void setLowest52WeekDate(String lowest52WeekDate) {
        this.lowest52WeekDate = lowest52WeekDate;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}