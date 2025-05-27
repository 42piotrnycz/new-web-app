package com.example.demo.service;

import com.example.demo.model.RefreshToken;
import com.example.demo.model.User;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.refresh-token.expiration-days:7}")
    private int refreshTokenExpirationDays;

    /**
     * Create a new refresh token for a user
     */
    @Transactional
    public String createRefreshToken(User user) {
        // Revoke any existing tokens for this user
        revokeAllUserTokens(user);

        // Create new refresh token
        String tokenValue = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(refreshTokenExpirationDays);
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(expiryDate)
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("Created refresh token for user: {}", user.getUsername());

        return tokenValue;
    }

    /**
     * Validate a refresh token
     */
    public Optional<RefreshToken> validateRefreshToken(String token) {
        return refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .filter(refreshToken -> refreshToken.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                    log.debug("Revoked refresh token: {}", token);
                });
    }

    /**
     * Revoke all refresh tokens for a user
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findByUserAndRevokedFalse(user)
                .forEach(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
        log.debug("Revoked all refresh tokens for user: {}", user.getUsername());
    }

    /**
     * Clean up expired tokens
     */
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(now);
        if (deletedCount > 0) {
            log.info("Cleaned up {} expired refresh tokens", deletedCount);
        }
    }

    /**
     * Check if user has any valid refresh tokens
     */
    public boolean hasValidRefreshToken(User user) {
        return refreshTokenRepository.findByUserAndRevokedFalse(user)
                .stream()
                .anyMatch(token -> token.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    /**
     * Check if user has any valid refresh tokens by username
     */
    public boolean hasValidRefreshToken(String username) {
        return userRepository.findByUsername(username)
                .map(this::hasValidRefreshToken)
                .orElse(false);
    }
}
