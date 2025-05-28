package com.example.demo.repository;

import com.example.demo.model.RefreshToken;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Find a non-revoked refresh token by token value
     */
    Optional<RefreshToken> findByTokenAndRevokeFalse(String token);

    /**
     * Find all non-revoked refresh tokens for a user
     */
    List<RefreshToken> findByUserAndRevokeFalse(User user);

    /**
     * Find a refresh token by token value regardless of revocation status
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Delete all expired refresh tokens
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :currentTime")
    int deleteByExpiryDateBefore(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Revoke all tokens for a specific user
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoke = true WHERE rt.user = :user AND rt.revoke = false")
    int revokeAllTokensForUser(@Param("user") User user);    /**
     * Count valid (non-revoked, non-expired) tokens for a user
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user = :user AND rt.revoke = false AND rt.expiryDate > :currentTime")
    long countValidTokensForUser(@Param("user") User user, @Param("currentTime") LocalDateTime currentTime);

    /**
     * Find all tokens that are expired but not yet cleaned up
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiryDate < :currentTime")
    List<RefreshToken> findExpiredTokens(@Param("currentTime") LocalDateTime currentTime);
}
