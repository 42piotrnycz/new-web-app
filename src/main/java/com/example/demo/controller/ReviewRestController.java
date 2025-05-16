package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewRestController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(@PathVariable Integer userId) {
        List<Review> reviews = reviewRepository.findByUserID(userId);
        return reviews.isEmpty()
                ? ResponseEntity.status(404).body(Map.of("error", "No reviews found for user ID " + userId))
                : ResponseEntity.ok(reviews);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable Integer reviewId) {
        return reviewRepository.findById(reviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestReviews() {
        List<Review> reviews = reviewRepository.findTop25ByOrderByReviewIDDesc();
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestParam(required = false) MultipartFile cover,
            @RequestParam String contentType,
            @RequestParam String contentTitle,
            @RequestParam(required = false) String reviewTitle,
            @RequestParam String reviewDescription,
            Principal principal) {
        try {
            if (contentType == null || contentType.trim().isEmpty() ||
                    contentTitle == null || contentTitle.trim().isEmpty() ||
                    reviewDescription == null || reviewDescription.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Required fields must not be empty"));
            }

            String fileName = null;
            if (cover != null && !cover.isEmpty()) {
                String uploadDir = new File("uploads").getAbsolutePath();
                new File(uploadDir).mkdirs();

                String extension = "";
                String originalFilename = cover.getOriginalFilename();
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
                }

                fileName = UUID.randomUUID().toString() + extension;
                cover.transferTo(new File(uploadDir, fileName));
            }

            Integer userID = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            Review review = new Review(userID, contentType.trim(), contentTitle.trim(),
                    reviewTitle != null ? reviewTitle.trim() : null,
                    reviewDescription.trim(), fileName);

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer reviewId, Principal principal) {
        return reviewRepository.findById(reviewId)
                .map(review -> {
                    Integer userID = userRepository.findByUsername(principal.getName())
                            .orElseThrow(() -> new RuntimeException("User not found"))
                            .getId();

                    if (!review.getUserID().equals(userID)) {
                        return ResponseEntity.status(403).body(Map.of("error", "Not authorized to delete this review"));
                    }

                    reviewRepository.delete(review);
                    return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
