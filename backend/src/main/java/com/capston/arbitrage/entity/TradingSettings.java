package com.capston.arbitrage.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trading_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradingSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Integer settingId;

    @Column(name = "setting_name", unique = true, nullable = false, length = 50)
    private String settingName;

    // 진입 조건
    @Column(name = "entry_min_premium", precision = 10, scale = 4)
    private BigDecimal entryMinPremium = BigDecimal.valueOf(2.0);

    @Column(name = "entry_min_net_premium", precision = 10, scale = 4)
    private BigDecimal entryMinNetPremium = BigDecimal.valueOf(1.5);

    @Column(name = "position_size", precision = 20, scale = 2)
    private BigDecimal positionSize = BigDecimal.valueOf(5000000);

    // 청산 조건
    @Column(name = "exit_target_premium", precision = 10, scale = 4)
    private BigDecimal exitTargetPremium = BigDecimal.valueOf(0.5);

    @Column(name = "exit_target_profit", precision = 20, scale = 2)
    private BigDecimal exitTargetProfit = BigDecimal.valueOf(50000);

    @Column(name = "exit_max_holding_time")
    private Integer exitMaxHoldingTime = 3600;

    // 손실 방어
    @Column(name = "stop_loss_max_amount", precision = 20, scale = 2)
    private BigDecimal stopLossMaxAmount = BigDecimal.valueOf(-30000);

    @Column(name = "stop_loss_max_rate", precision = 10, scale = 6)
    private BigDecimal stopLossMaxRate = BigDecimal.valueOf(-0.01);

    @Column(name = "stop_loss_reverse_premium", precision = 10, scale = 4)
    private BigDecimal stopLossReversePremium = BigDecimal.valueOf(-1.0);

    // 트레일링 스톱
    @Column(name = "trailing_enabled")
    private Boolean trailingEnabled = true;

    @Column(name = "trailing_activation_profit", precision = 20, scale = 2)
    private BigDecimal trailingActivationProfit = BigDecimal.valueOf(30000);

    @Column(name = "trailing_distance", precision = 20, scale = 2)
    private BigDecimal trailingDistance = BigDecimal.valueOf(10000);

    // 리밸런싱
    @Column(name = "rebalance_threshold", precision = 10, scale = 4)
    private BigDecimal rebalanceThreshold = BigDecimal.valueOf(0.15);

    @Column(name = "rebalance_check_interval")
    private Integer rebalanceCheckInterval = 3600;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}