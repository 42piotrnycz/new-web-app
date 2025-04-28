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
    public String addReview(@RequestParam("file") MultipartFile file,
                            @RequestParam("contentType") String contentType,
                            @RequestParam("contentTitle") String contentTitle,
                            @RequestParam("reviewTitle") String reviewTitle,
                            @RequestParam("reviewDescription") String reviewDescription,
                            Principal principal) throws IOException {

        // 1. Ścieżka na dysku
        String uploadDir = "uploads/";
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs();  // <-- stworzy uploads/ jeśli brak
        }

        // 2. Zapis pliku
        String fileName = file.getOriginalFilename();
        File destination = new File(uploadPath, fileName);
        file.transferTo(destination);

        // 3. Zapis danych do bazy
        Review review = new Review();
        review.setUserID(getUserIDFromPrincipal(principal));  // <- np. funkcja która znajdzie ID użytkownika
        review.setContentType(contentType);
        review.setContentTitle(contentTitle);
        review.setReviewTitle(reviewTitle);
        review.setReviewDescription(reviewDescription);
        // możesz też zapisać ścieżkę do okładki w bazie
        // review.setCoverPath(uploadDir + fileName);

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
