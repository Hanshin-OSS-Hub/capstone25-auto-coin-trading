package com.capston.arbitrage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "사용자 ID는 필수입니다")
    @Size(min = 4, max = 50, message = "사용자 ID는 4~50자 사이여야 합니다")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 6, max = 100, message = "비밀번호는 6자 이상이어야 합니다")
    private String password;

    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String email;

    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;
}