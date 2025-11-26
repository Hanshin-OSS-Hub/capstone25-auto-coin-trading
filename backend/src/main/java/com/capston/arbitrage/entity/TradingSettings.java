package com.capston.arbitrage.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trading_settings")
public class TradingSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "setting_name", nullable = false)
    private String settingName;

    @Column(name = "entry_min_premium")
    private Double entryMinPremium;

    @Column(name = "position_size")
    private Double positionSize;

    @Column(name = "exit_target_premium")
    private Double exitTargetPremium;

    @Column(name = "trailing_enabled")
    private Boolean trailingEnabled;

    // 기본 생성자
    public TradingSettings() {
    }

    // 전체 생성자
    public TradingSettings(Integer id, String settingName, Double entryMinPremium,
                           Double positionSize, Double exitTargetPremium, Boolean trailingEnabled) {
        this.id = id;
        this.settingName = settingName;
        this.entryMinPremium = entryMinPremium;
        this.positionSize = positionSize;
        this.exitTargetPremium = exitTargetPremium;
        this.trailingEnabled = trailingEnabled;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSettingName() {
        return settingName;
    }

    public void setSettingName(String settingName) {
        this.settingName = settingName;
    }

    public Double getEntryMinPremium() {
        return entryMinPremium;
    }

    public void setEntryMinPremium(Double entryMinPremium) {
        this.entryMinPremium = entryMinPremium;
    }

    public Double getPositionSize() {
        return positionSize;
    }

    public void setPositionSize(Double positionSize) {
        this.positionSize = positionSize;
    }

    public Double getExitTargetPremium() {
        return exitTargetPremium;
    }

    public void setExitTargetPremium(Double exitTargetPremium) {
        this.exitTargetPremium = exitTargetPremium;
    }

    public Boolean getTrailingEnabled() {
        return trailingEnabled;
    }

    public void setTrailingEnabled(Boolean trailingEnabled) {
        this.trailingEnabled = trailingEnabled;
    }
}