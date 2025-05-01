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
                            Principal principal) throws IOException {

        // 1. Ścieżka na dysku
        String uploadDir = new File("uploads").getAbsolutePath();

        // 2. Zapis pliku
        String originalFilename = cover.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String fileName = UUID.randomUUID().toString() + extension;

        File destination = new File(uploadDir, fileName);
        cover.transferTo(destination);

        // 3. Zapis danych do bazy

        Review review = new Review();
        review.setUserID(getUserIDFromPrincipal(principal));
        review.setContentType(contentType);
        review.setContentTitle(contentTitle);
        review.setReviewTitle(reviewTitle);
        review.setReviewDescription(reviewDescription);
        review.setCoverFile(fileName);  // <-- nowy wiersz

        reviewRepository.save(review);

        return "redirect:/reviews";
    }


    private Integer getUserIDFromPrincipal(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }

}
