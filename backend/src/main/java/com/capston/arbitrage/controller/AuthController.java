package com.capston.arbitrage.controller;

import com.capston.arbitrage.dto.AuthResponse;
import com.capston.arbitrage.dto.LoginRequest;
import com.capston.arbitrage.dto.MessageResponse;
import com.capston.arbitrage.dto.SignupRequest;
import com.capston.arbitrage.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("로그인 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("아이디 또는 비밀번호가 올바르지 않습니다"));
        }
    }

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            authService.signup(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new MessageResponse("회원가입이 완료되었습니다"));
        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * 사용자 ID 중복 체크
     * GET /api/auth/check-username?username=test
     */
    @GetMapping("/check-username")
    public ResponseEntity<MessageResponse> checkUsername(@RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);
        if (available) {
            return ResponseEntity.ok(new MessageResponse("사용 가능한 ID입니다"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("이미 사용 중인 ID입니다"));
        }
    }

    /**
     * 이메일 중복 체크
     * GET /api/auth/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<MessageResponse> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        if (available) {
            return ResponseEntity.ok(new MessageResponse("사용 가능한 이메일입니다"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("이미 사용 중인 이메일입니다"));
        }
    }

    /**
     * 테스트용 엔드포인트
     * GET /api/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<MessageResponse> test() {
        return ResponseEntity.ok(new MessageResponse("Auth API 연결 성공!"));
    }
}