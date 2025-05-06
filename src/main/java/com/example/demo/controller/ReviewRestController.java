package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewRestController {
    private final ReviewRepository reviewRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(@PathVariable Integer userId) {
        List<Review> reviews = reviewRepository.findByUserID(userId);
        return reviews.isEmpty() 
            ? ResponseEntity.status(404).body(Map.of("error", "Brak recenzji dla użytkownika o ID " + userId))
            : ResponseEntity.ok(reviews);
    }
}
