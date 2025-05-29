package com.example.demo.service;

import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.model.UserFavoriteReview;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserFavoriteReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFavoriteReviewService {

    private final UserFavoriteReviewRepository userFavoriteReviewRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final LogService logService;

    @Transactional
    public boolean toggleFavorite(Integer reviewId, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found with ID: " + reviewId);
        }

        var existingFavorite = userFavoriteReviewRepository.findByUserIdAndReviewId(user.getId(), reviewId);

        if (existingFavorite.isPresent()) {
            userFavoriteReviewRepository.deleteByUserIdAndReviewId(user.getId(), reviewId);
            logService.logUserActivity(user.getId(), "Removed review " + reviewId + " from favorites");
            log.info("User {} removed review {} from favorites", username, reviewId);
            return false;
        } else {
            UserFavoriteReview favorite = new UserFavoriteReview(user.getId(), reviewId);
            userFavoriteReviewRepository.save(favorite);
            logService.logUserActivity(user.getId(), "Added review " + reviewId + " to favorites");
            log.info("User {} added review {} to favorites", username, reviewId);
            return true;
        }
    }

    public boolean isFavorited(Integer reviewId, Principal principal) {
        if (principal == null) {
            return false;
        }

        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return userFavoriteReviewRepository.findByUserIdAndReviewId(user.getId(), reviewId).isPresent();
    }

    public List<Review> getUserFavoriteReviews(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<UserFavoriteReview> userFavorites = userFavoriteReviewRepository.findByUserId(user.getId());

        return userFavorites.stream()
                .map(favorite -> reviewRepository.findById(favorite.getReviewId()))
                .filter(optionalReview -> optionalReview.isPresent())
                .map(optionalReview -> optionalReview.get())
                .collect(Collectors.toList());
    }

    public Long getFavoriteCount(Integer reviewId) {
        return userFavoriteReviewRepository.countByReviewId(reviewId);
    }

    @Transactional
    public void removeAllUserFavorites(Integer userId) {
        userFavoriteReviewRepository.deleteByUserId(userId);
        log.info("Removed all favorite reviews for user {}", userId);
    }

    @Transactional
    public void removeAllFavoritesForReview(Integer reviewId) {
        userFavoriteReviewRepository.deleteByReviewId(reviewId);
        log.info("Removed all favorites for review {}", reviewId);
    }
}
