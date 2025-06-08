package com.vacancy.controller;

import com.vacancy.dto.UserDto;
import com.vacancy.dto.UserRegisterDto;
import com.vacancy.dto.UserLoginDto;
import com.vacancy.model.User;
import com.vacancy.service.UserService;
import com.vacancy.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserRegisterDto registerDto) {
        UserDto user = userService.registerUser(registerDto);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto loginDto) {
        return userService.findByEmail(loginDto.getEmail())
                .filter(user -> passwordEncoder.matches(loginDto.getPassword(), user.getPasswordHash()))
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
                    return ResponseEntity.ok(java.util.Map.of("token", token));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid credentials")));
    }
} 