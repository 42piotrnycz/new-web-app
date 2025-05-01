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

    // GET /api/reviews/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(@PathVariable Integer userId) {
        List<Review> reviews = reviewRepository.findByUserID(userId);
        if (reviews.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Brak recenzji dla użytkownika o ID " + userId));
        }
        return ResponseEntity.ok(reviews);
    }
}
