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

    @Transactional
    public String createRefreshToken(User user) {
        revokeAllUserTokens(user);

        String tokenValue = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(refreshTokenExpirationDays);
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(expiryDate)
                .revoke(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("Created refresh token for user: {}", user.getUsername());

        return tokenValue;
    }

    public Optional<RefreshToken> validateRefreshToken(String token) {
        return refreshTokenRepository.findByTokenAndRevokeFalse(token)
                .filter(refreshToken -> refreshToken.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByTokenAndRevokeFalse(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoke(true);
                    refreshTokenRepository.save(refreshToken);
                    log.debug("Revoked refresh token: {}", token);
                });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findByUserAndRevokeFalse(user)
                .forEach(token -> {
                    token.setRevoke(true);
                    refreshTokenRepository.save(token);
                });
        log.debug("Revoked all refresh tokens for user: {}", user.getUsername());
    }


    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(now);
        if (deletedCount > 0) {
            log.info("Cleaned up {} expired refresh tokens", deletedCount);
        }
    }

    public boolean hasValidRefreshToken(User user) {
        return refreshTokenRepository.findByUserAndRevokeFalse(user)
                .stream()
                .anyMatch(token -> token.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    public boolean hasValidRefreshToken(String username) {
        return userRepository.findByUsername(username)
                .map(this::hasValidRefreshToken)
                .orElse(false);
    }
}
