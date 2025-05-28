package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping("/add-review")
    public String showAddReviewForm() {
        return "add-review";
    }

    @PostMapping("/add-review")
    public String addReview(@RequestParam("cover") MultipartFile cover,
                            @RequestParam("contentType") String contentType,
                            @RequestParam("contentTitle") String contentTitle,
                            @RequestParam("reviewTitle") String reviewTitle,
                            @RequestParam("reviewDescription") String reviewDescription,
                            Principal principal,
                            Model model) {
        try {
            if (contentType == null || contentType.trim().isEmpty() ||
                    contentTitle == null || contentTitle.trim().isEmpty() ||
                    reviewDescription == null || reviewDescription.trim().isEmpty()) {
                model.addAttribute("error", "Wszystkie pola oznaczone jako wymagane muszą być wypełnione");
                return "add-review";
            }

            String fileName = null;
            if (!cover.isEmpty()) {
                String uploadDir = new File("uploads").getAbsolutePath();
                new File(uploadDir).mkdirs();

                String extension = "";
                String originalFilename = cover.getOriginalFilename();
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
                }

                fileName = UUID.randomUUID() + extension;
                cover.transferTo(new File(uploadDir, fileName));
            }

            Integer userID = getUserIDFromPrincipal(principal);
            Review review = new Review(userID, contentType.trim(), contentTitle.trim(),
                    reviewTitle != null ? reviewTitle.trim() : null,
                    reviewDescription.trim(), fileName);

            reviewRepository.save(review);
            return "redirect:/reviews/user/" + userID;
        } catch (Exception e) {
            model.addAttribute("error", "Wystąpił błąd podczas dodawania recenzji: " + e.getMessage());
            return "add-review";
        }
    }

    @GetMapping("reviews/user/{userId}")
    public String getUserReviews(@PathVariable Integer userId, Model model) {
        List<Review> reviews = reviewRepository.findByUserID(userId);
        model.addAttribute("reviews", reviews);
        model.addAttribute("userId", userId);
        return "user-reviews";
    }

    private Integer getUserIDFromPrincipal(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()))
                .getId();
    }
}
