package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.RefreshTokenService;
import com.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "User Management", description = "APIs for user authentication, registration, and management")
public class UserRestController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "User Login", description = "Authenticate user with username and password. Returns JWT token for subsequent API calls.", tags = {
            "Authentication"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(value = """
                    {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "userId": 1,
                        "username": "john_doe",
                        "role": "ROLE_USER"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Invalid credentials or missing parameters", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Invalid username or password"
                    }
                    """)))
    })
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(
            @Parameter(description = "User credentials", required = true, example = "{\"username\": \"john_doe\", \"password\": \"password123\"}") @RequestBody Map<String, String> credentials) {
        try {
            log.info("Attempting login for user: {}", credentials.get("username"));

            if (credentials.get("username") == null || credentials.get("password") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }

            String usernameValue = credentials.get("username");
            String passwordValue = credentials.get("password");

            Authentication authentication = userService.authenticateUser(usernameValue, passwordValue,
                    authenticationManager);
            String token = jwtUtil.generateToken(usernameValue,
                    authentication.getAuthorities().iterator().next().getAuthority());

            Integer userId = userService.getUserIdByUsername(usernameValue);
            User user = userService.getUserByUsername(usernameValue)
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            log.info("Login successful for user: {}", usernameValue);

            String role = user.getRole().name();
            String refreshTokenValue = refreshTokenService.createRefreshToken(user);

            ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshTokenValue)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("userId", userId);
            responseMap.put("username", usernameValue);
            responseMap.put("role", role);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(responseMap);
        } catch (BadCredentialsException e) {
            log.error("Invalid credentials for user: {}", credentials.get("username"));
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Login error for user: {}", credentials.get("username"), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @Operation(summary = "User Registration", description = "Register a new user account with username, password, and email.", tags = {
            "Authentication"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registration successful", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "User registered successfully"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Registration failed - missing fields or username already exists", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Username already exists"
                    }
                    """)))
    })
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(
            @Parameter(description = "User registration data", required = true, example = "{\"username\": \"john_doe\", \"password\": \"password123\", \"email\": \"john@example.com\"}") @RequestBody Map<String, String> registration) {
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
    }

    @Operation(summary = "Get Current User", description = "Get details of the currently authenticated user based on JWT token.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User details retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "id": 1,
                        "username": "john_doe",
                        "email": "john@example.com",
                        "role": "ROLE_USER"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        return userService.getUserByUsername(principal.getName())
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole().name());
                    return ResponseEntity.ok(userMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get User by ID", description = "Retrieve user details by their unique identifier.", tags = {
            "User Management"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "id": 1,
                        "username": "john_doe",
                        "email": "john@example.com"
                    }
                    """))),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @Parameter(description = "User ID", required = true, example = "1") @PathVariable Integer id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok().body(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get All Users", description = "Retrieve a list of all users in the system. Requires admin privileges.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Admin"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                        {
                            "id": 1,
                            "username": "john_doe",
                            "email": "john@example.com",
                            "role": "ROLE_USER"
                        },
                        {
                            "id": 2,
                            "username": "admin",
                            "email": "admin@example.com",
                            "role": "ROLE_ADMIN"
                        }
                    ]
                    """))),
            @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
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

    @Operation(summary = "Update User Role", description = "Update the role of a specific user. Requires admin privileges.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Admin"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Role updated successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "Role updated successfully",
                        "id": 1,
                        "username": "john_doe",
                        "role": "ROLE_ADMIN"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Invalid role provided", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Invalid role"
                    }
                    """))),
            @ApiResponse(responseCode = "403", description = "Access denied - admin role required"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @Parameter(description = "User ID", required = true, example = "1") @PathVariable Integer id,
            @Parameter(description = "Role update request", required = true, example = "{\"role\": \"ROLE_ADMIN\"}") @RequestBody Map<String, String> request,
            Principal principal) {
        try {
            String newRole = request.get("role");
            User updatedUser = userService.updateUserRole(id, newRole, principal);

            return ResponseEntity.ok(Map.of(
                    "message", "Role updated successfully",
                    "id", updatedUser.getId(),
                    "username", updatedUser.getUsername(),
                    "role", updatedUser.getRole().name()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Search Users", description = "Search for users by username using case-insensitive partial matching.", tags = {
            "User Management"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                        {
                            "id": 1,
                            "username": "john_doe"
                        },
                        {
                            "id": 3,
                            "username": "jane_doe"
                        }
                    ]
                    """)))
    })
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @Parameter(description = "Username search term", required = true, example = "doe") @RequestParam String username) {
        List<User> users = userService.searchUsers(username);
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

    @Operation(summary = "Delete User", description = "Delete a user and all their reviews. Admin users cannot be deleted. Requires admin privileges.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Admin"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User deleted successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "User and all their reviews deleted successfully"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Cannot delete admin users", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Cannot delete admin users"
                    }
                    """))),
            @ApiResponse(responseCode = "403", description = "Access denied - admin role required"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error during deletion", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Failed to delete user: Database error"
                    }
                    """)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @Parameter(description = "User ID to delete", required = true, example = "1") @PathVariable Integer id,
            Principal principal) {
        try {
            userService.deleteUser(id, principal);
            return ResponseEntity.ok(Map.of("message", "User and all their reviews deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    @Operation(summary = "User Logout", description = "Logout user by clearing the JWT cookie.", tags = {
            "Authentication"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logout successful", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "Logout successful"
                    }
                    """)))
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, Principal principal) {
        try {
            userService.logoutUser(principal, refreshTokenService, log);
        } catch (Exception e) {
            log.warn("Error revoking refresh tokens during logout", e);
        }

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("message", "Logout successful"));
    }

    @Operation(summary = "Refresh JWT Token", description = "Use refresh token to get a new JWT token.", tags = {
            "Authentication"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "Token refreshed successfully"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Invalid or expired refresh token"
                    }
                    """)))
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Refresh token not found"));
            }

            var refreshTokenResult = refreshTokenService.validateRefreshToken(refreshToken);
            if (refreshTokenResult.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
            }

            var user = refreshTokenResult.get().getUser();
            String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole().toString());

            refreshTokenService.revokeRefreshToken(refreshToken);
            String newRefreshToken = refreshTokenService.createRefreshToken(user);

            ResponseCookie jwtCookie = ResponseCookie.from("jwt", newToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("message", "Token refreshed successfully");
            responseMap.put("userId", user.getId());
            responseMap.put("username", user.getUsername());
            responseMap.put("role", user.getRole().name());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(responseMap);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
