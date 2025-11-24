package com.capston.arbitrage.service;

import com.capston.arbitrage.entity.TradingSettings;
import com.capston.arbitrage.repository.TradingSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradingSettingsService {

    private final TradingSettingsRepository repository;

    // 모든 설정 조회
    public List<TradingSettings> getAllSettings() {
        return repository.findAll();
    }

    // ID로 설정 조회
    public TradingSettings getSettingById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("설정을 찾을 수 없습니다: " + id));
    }

    // 설정 저장
    @Transactional
    public TradingSettings saveSetting(TradingSettings settings) {
        return repository.save(settings);
    }

    // 설정 수정
    @Transactional
    public TradingSettings updateSetting(Integer id, TradingSettings settings) {
        TradingSettings existing = getSettingById(id);

        existing.setSettingName(settings.getSettingName());
        existing.setEntryMinPremium(settings.getEntryMinPremium());
        existing.setPositionSize(settings.getPositionSize());
        existing.setExitTargetPremium(settings.getExitTargetPremium());
        existing.setTrailingEnabled(settings.getTrailingEnabled());

        return repository.save(existing);
    }
}