package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Controller
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;


    @Autowired
    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/add-review")
    public String showAddReviewForm(Model model) {
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
            // Validate required fields
            if (contentType == null || contentType.trim().isEmpty() ||
                contentTitle == null || contentTitle.trim().isEmpty() ||
                reviewDescription == null || reviewDescription.trim().isEmpty()) {
                model.addAttribute("error", "Wszystkie pola oznaczone jako wymagane muszą być wypełnione");
                return "add-review";
            }

            // First handle the file upload
            String fileName = null;
            if (!cover.isEmpty()) {
                String uploadDir = new File("uploads").getAbsolutePath();
                new File(uploadDir).mkdirs();

                String originalFilename = cover.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
                }

                fileName = UUID.randomUUID().toString() + extension;
                File destination = new File(uploadDir, fileName);
                cover.transferTo(destination);
            }

            // Get the user ID first
            Integer userID = getUserIDFromPrincipal(principal);

            // Create and populate the review object in the correct order
            Review review = new Review(
                userID,
                contentType.trim(),
                contentTitle.trim(),
                reviewTitle != null ? reviewTitle.trim() : null,
                reviewDescription.trim(),
                fileName
            );

            reviewRepository.save(review);
            
            return "redirect:/reviews/user/" + userID;
        } catch (Exception e) {
            model.addAttribute("error", "Wystąpił błąd podczas dodawania recenzji: " + e.getMessage());
            return "add-review";
        }
    }

    private Integer getUserIDFromPrincipal(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }

    @GetMapping("reviews/user/{userId}")
    public String getUserReviews(@PathVariable Integer userId, Model model) {
        try {
            List<Review> reviews = reviewRepository.findByUserID(userId);
            model.addAttribute("reviews", reviews);
            model.addAttribute("userId", userId);
            return "user-reviews";
        } catch (Exception e) {
            model.addAttribute("error", "Wystąpił błąd podczas pobierania recenzji: " + e.getMessage());
            return "error";
        }
    }

}
