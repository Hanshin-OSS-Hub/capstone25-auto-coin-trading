package com.capston.arbitrage.repository;

import com.capston.arbitrage.entity.TradingSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TradingSettingsRepository extends JpaRepository<TradingSettings, Integer> {

    // 설정 이름으로 찾기
    Optional<TradingSettings> findBySettingName(String settingName);
}