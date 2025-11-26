package com.capston.arbitrage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    /**
     * 업비트 API용 WebClient
     */
    @Bean(name = "upbitWebClient")
    public WebClient upbitWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.upbit.com")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    /**
     * 바이낸스 API용 WebClient
     */
    @Bean(name = "binanceWebClient")
    public WebClient binanceWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.binance.com")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    /**
     * 환율 API용 WebClient
     */
    @Bean(name = "exchangeRateWebClient")
    public WebClient exchangeRateWebClient() {
        return WebClient.builder()
                .baseUrl("https://open.er-api.com")
                .defaultHeader("Accept", "application/json")
                .build();
    }
}