package com.example.demo.repository;

import com.example.demo.model.UserFavoriteReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteReviewRepository extends JpaRepository<UserFavoriteReview, Integer> {

    Optional<UserFavoriteReview> findByUserIdAndReviewId(Integer userId, Integer reviewId);

    List<UserFavoriteReview> findByUserId(Integer userId);

    Long countByReviewId(Integer reviewId);

    void deleteByUserIdAndReviewId(Integer userId, Integer reviewId);

    void deleteByUserId(Integer userId);

    void deleteByReviewId(Integer reviewId);
}
