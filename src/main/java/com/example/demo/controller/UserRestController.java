package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserRestController {
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            log.info("Attempting login for user: {}", credentials.get("username"));

            if (credentials.get("username") == null || credentials.get("password") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            credentials.get("username"),
                            credentials.get("password")));

            String token = jwtUtil.generateToken(credentials.get("username"),
                    authentication.getAuthorities().iterator().next().getAuthority());

            Integer userId = userService.getUserIdByUsername(credentials.get("username"));

            log.info("Login successful for user: {}", credentials.get("username"));            // Get the user's role
            String role = userRepository.findByUsername(credentials.get("username"))
                    .map(user -> user.getRole().name())
                    .orElse("ROLE_USER");

            // Create response map with role
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("token", token);
            responseMap.put("userId", userId);
            responseMap.put("username", credentials.get("username"));
            responseMap.put("role", role);
            
            return ResponseEntity.ok(responseMap);
        } catch (BadCredentialsException e) {
            log.error("Invalid credentials for user: {}", credentials.get("username"));
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Login error for user: {}", credentials.get("username"), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(@RequestBody Map<String, String> registration) {
        try {
            String username = registration.get("username");
            String password = registration.get("password");
            String email = registration.get("email");

            if (username == null || password == null || email == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
            }

            if (userService.registerUser(username, password, email)) {
                return ResponseEntity.ok(Map.of("message", "User registered successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole().name());
                    return ResponseEntity.ok(userMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }@GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok().body(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = users.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().name());
                return userMap;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
            .map(user -> {
                String newRole = request.get("role");
                try {
                    User.Role role = User.Role.valueOf(newRole);
                    user.setRole(role);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "message", "Role updated successfully",
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "role", user.getRole().name()
                    ));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String username) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(username);
        List<Map<String, Object>> response = users.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                return userMap;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}
