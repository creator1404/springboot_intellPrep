package com.intelliprep.controller;

import com.intelliprep.config.JwtUtil;
import com.intelliprep.model.User;
import com.intelliprep.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * POST /api/auth/google
     * Receives { name, email } from Firebase Google Sign-In on the frontend.
     * Creates user if not exists, returns JWT cookie + user object.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> body,
                                        HttpServletResponse response) {
        try {
            String name = body.get("name");
            String email = body.get("email");

            if (name == null || email == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "name and email required"));
            }

            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setName(name);
                newUser.setEmail(email);
                newUser.setCredits(100);
                return userRepository.save(newUser);
            });

            // Generate JWT
            String token = jwtUtil.generateToken(user.getId());

            // Set cookie (same as Node: httpOnly, 7 days)
            Cookie cookie = new Cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // set true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days in seconds
            response.addCookie(cookie);

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Google auth error: " + e.getMessage()));
        }
    }

    /**
     * GET /api/auth/logout
     * Clears the JWT cookie.
     */
    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            Cookie cookie = new Cookie("token", null);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(0); // Delete cookie
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("message", "LogOut Successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Logout error: " + e.getMessage()));
        }
    }
}
