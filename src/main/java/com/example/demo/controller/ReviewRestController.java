package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewRestController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(@PathVariable Integer userId) {
        try {
            List<Review> reviews = reviewRepository.findByUserID(userId);
            if (reviews.isEmpty()) {
                return ResponseEntity.ok()
                        .body(Map.of("message", "Brak recenzji dla użytkownika o ID " + userId));
            }
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Wystąpił błąd podczas pobierania recenzji: " + e.getMessage()));
        }
    }
}
