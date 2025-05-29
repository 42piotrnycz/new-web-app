package com.example.demo.service;

import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {
    private static final String UPLOADS_DIR = "uploads";
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LogService logService;
    private final UserService userService;
    private final UserFavoriteReviewService userFavoriteReviewService;

    public List<Review> getReviewsByUserId(Integer userId) {
        return reviewRepository.findByUserID(userId);
    }

    public Optional<Review> getReviewById(Integer reviewId) {
        return reviewRepository.findById(reviewId);
    }

    public List<Review> getLatestReviews() {
        return reviewRepository.findTop25ByOrderByReviewIDDesc();
    }

    public List<Review> getReviewsByContentTitle(String title) {
        return reviewRepository.findByContentTitleIgnoreCase(title);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Transactional
    public Review createReview(String contentType, String contentTitle, String reviewTitle,
                               String reviewDescription, MultipartFile coverFile, Principal principal) throws IOException {
        String username = principal.getName();
        Integer userId = userService.getUserIdByUsername(username);

        String fileName = null;
        if (coverFile != null && !coverFile.isEmpty()) {
            fileName = handleFileUpload(coverFile);
        }

        Review review = new Review(null, userId, contentType, contentTitle, reviewTitle, reviewDescription, fileName);
        Review savedReview = reviewRepository.save(review);

        logService.logUserActivity(userId, "Created review: " + contentTitle);
        logService.logReviewActivity(savedReview.getReviewID(), "Review created");

        return savedReview;
    }

    @Transactional
    public Review updateReview(Integer reviewId, String contentType, String contentTitle, String reviewTitle,
                               String reviewDescription, MultipartFile coverFile, Principal principal) throws IOException {
        String username = principal.getName();
        Integer userId = userService.getUserIdByUsername(username);

        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole().toString());
        if (!existingReview.getUserID().equals(userId) && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to update this review");
        }

        existingReview.setContentType(contentType);
        existingReview.setContentTitle(contentTitle);
        existingReview.setReviewTitle(reviewTitle);
        existingReview.setReviewDescription(reviewDescription);

        if (coverFile != null && !coverFile.isEmpty()) {
            if (existingReview.getCoverFile() != null) {
                deleteFile(existingReview.getCoverFile());
            }

            String newFileName = handleFileUpload(coverFile);
            existingReview.setCoverFile(newFileName);
        }

        Review updatedReview = reviewRepository.save(existingReview);

        logService.logUserActivity(userId, "Updated review: " + contentTitle);
        logService.logReviewActivity(reviewId, "Review updated");

        if (isAdmin && !existingReview.getUserID().equals(userId)) {
            logService.logAdminActivity(userId,
                    "Admin updated review ID: " + reviewId + " by user ID: " + existingReview.getUserID());
        }

        return updatedReview;
    }

    @Transactional
    public void deleteReview(Integer reviewId, Principal principal) {
        String username = principal.getName();
        Integer userId = userService.getUserIdByUsername(username);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole().toString());
        if (!review.getUserID().equals(userId) && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this review");
        }
        if (review.getCoverFile() != null) {
            deleteFile(review.getCoverFile());
        }

        userFavoriteReviewService.removeAllFavoritesForReview(reviewId);

        reviewRepository.delete(review);

        logService.logUserActivity(userId, "Deleted review: " + review.getContentTitle());
        logService.logReviewActivity(reviewId, "Review deleted");

        if (isAdmin && !review.getUserID().equals(userId)) {
            logService.logAdminActivity(userId,
                    "Admin deleted review ID: " + reviewId + " by user ID: " + review.getUserID());
        }
    }

    private String handleFileUpload(MultipartFile file) throws IOException {
        File uploadsDir = new File(UPLOADS_DIR);
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName != null ? originalFileName.substring(originalFileName.lastIndexOf('.'))
                : "";
        String newFileName = UUID.randomUUID() + fileExtension;

        Path filePath = Paths.get(UPLOADS_DIR, newFileName);
        Files.write(filePath, file.getBytes());

        return newFileName;
    }

    private void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(UPLOADS_DIR, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileName, e);
        }
    }
}
