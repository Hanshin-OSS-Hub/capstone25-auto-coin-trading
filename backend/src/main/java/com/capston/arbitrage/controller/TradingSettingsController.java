package com.capston.arbitrage.controller;

import com.capston.arbitrage.entity.TradingSettings;
import com.capston.arbitrage.service.TradingSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // React 프론트엔드 허용
public class TradingSettingsController {

    private final TradingSettingsService service;

    // GET /api/settings - 모든 설정 조회
    @GetMapping
    public ResponseEntity<List<TradingSettings>> getAllSettings() {
        return ResponseEntity.ok(service.getAllSettings());
    }

    // GET /api/settings/{id} - 특정 설정 조회
    @GetMapping("/{id}")
    public ResponseEntity<TradingSettings> getSettingById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getSettingById(id));
    }

    // POST /api/settings - 새 설정 생성
    @PostMapping
    public ResponseEntity<TradingSettings> createSetting(@RequestBody TradingSettings settings) {
        return ResponseEntity.ok(service.saveSetting(settings));
    }

    // PUT /api/settings/{id} - 설정 수정
    @PutMapping("/{id}")
    public ResponseEntity<TradingSettings> updateSetting(
            @PathVariable Integer id,
            @RequestBody TradingSettings settings) {
        return ResponseEntity.ok(service.updateSetting(id, settings));
    }

    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API 연결 성공!");
    }
}
