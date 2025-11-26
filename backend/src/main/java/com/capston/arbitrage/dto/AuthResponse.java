package com.capston.arbitrage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private String username;
    private String email;
    private String name;
    private String role;

    public AuthResponse(String token, String username, String email, String name, String role) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}