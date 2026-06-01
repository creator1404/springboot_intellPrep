package com.intelliprep.controller;

import com.intelliprep.model.User;
import com.intelliprep.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * GET /api/user/current-user
     * Returns the authenticated user's profile.
     */
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");

            User user = userRepository.findById(userId)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("message", "user does not found"));
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to get currentUser: " + e.getMessage()));
        }
    }
}
