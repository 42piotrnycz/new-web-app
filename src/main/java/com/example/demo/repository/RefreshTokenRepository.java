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

    Optional<RefreshToken> findByTokenAndRevokeFalse(String token);

    List<RefreshToken> findByUserAndRevokeFalse(User user);

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :currentTime")
    int deleteByExpiryDateBefore(@Param("currentTime") LocalDateTime currentTime);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoke = true WHERE rt.user = :user AND rt.revoke = false")
    int revokeAllTokensForUser(@Param("user") User user);

    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user = :user AND rt.revoke = false AND rt.expiryDate > :currentTime")
    long countValidTokensForUser(@Param("user") User user, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiryDate < :currentTime")
    List<RefreshToken> findExpiredTokens(@Param("currentTime") LocalDateTime currentTime);
}
