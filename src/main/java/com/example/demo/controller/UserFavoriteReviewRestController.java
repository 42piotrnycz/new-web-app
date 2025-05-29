package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.service.UserFavoriteReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "User Favorite Reviews", description = "APIs for managing user favorite reviews")
@SecurityRequirement(name = "bearerAuth")
public class UserFavoriteReviewRestController {

    private final UserFavoriteReviewService userFavoriteReviewService;

    @Operation(summary = "Toggle Review Favorite", description = "Add or remove a review from user's favorites. Returns true if added, false if removed.", tags = {"Favorites"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Favorite toggled successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(value = """
                    {
                        "isFavorited": true,
                        "message": "Review added to favorites"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Review not found with ID: 123"
                    }
                    """)))
    })
    @PostMapping("/toggle/{reviewId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleFavorite(
            @Parameter(description = "Review ID to toggle favorite", required = true, example = "1") @PathVariable Integer reviewId,
            Principal principal) {
        try {
            boolean isFavorited = userFavoriteReviewService.toggleFavorite(reviewId, principal);
            String message = isFavorited ? "Review added to favorites" : "Review removed from favorites";

            return ResponseEntity.ok(Map.of(
                    "isFavorited", isFavorited,
                    "message", message,
                    "reviewId", reviewId
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to toggle favorite: " + e.getMessage()));
        }
    }

    @Operation(summary = "Check if Review is Favorited", description = "Check if a specific review is favorited by the current user.", tags = {"Favorites"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Favorite status retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(value = """
                    {
                        "isFavorited": true,
                        "reviewId": 1
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated")
    })
    @GetMapping("/check/{reviewId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkFavoriteStatus(
            @Parameter(description = "Review ID to check favorite status", required = true, example = "1") @PathVariable Integer reviewId,
            Principal principal) {
        try {
            boolean isFavorited = userFavoriteReviewService.isFavorited(reviewId, principal);
            return ResponseEntity.ok(Map.of(
                    "isFavorited", isFavorited,
                    "reviewId", reviewId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to check favorite status: " + e.getMessage()));
        }
    }

    @Operation(summary = "Get User's Favorite Reviews", description = "Retrieve all reviews favorited by the current user.", tags = {"Favorites"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Favorite reviews retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class), examples = @ExampleObject(value = """
                    [
                        {
                            "id": 1,
                            "contentTitle": "The Matrix",
                            "contentType": "MOVIE",
                            "rating": 5,
                            "reviewText": "Amazing movie!",
                            "reviewerUsername": "john_doe",
                            "createdAt": "2023-12-01T10:00:00Z"
                        }
                    ]
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated")
    })
    @GetMapping("/my-favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserFavoriteReviews(Principal principal) {
        try {
            List<Review> favoriteReviews = userFavoriteReviewService.getUserFavoriteReviews(principal);
            return ResponseEntity.ok(favoriteReviews);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve favorite reviews: " + e.getMessage()));
        }
    }

    @Operation(summary = "Get Favorite Count for Review", description = "Get the total number of users who favorited a specific review.", tags = {"Favorites"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Favorite count retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(value = """
                    {
                        "reviewId": 1,
                        "favoriteCount": 42
                    }
                    """)))
    })
    @GetMapping("/count/{reviewId}")
    public ResponseEntity<?> getFavoriteCount(
            @Parameter(description = "Review ID to get favorite count", required = true, example = "1") @PathVariable Integer reviewId) {
        try {
            Long favoriteCount = userFavoriteReviewService.getFavoriteCount(reviewId);
            return ResponseEntity.ok(Map.of(
                    "reviewId", reviewId,
                    "favoriteCount", favoriteCount
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get favorite count: " + e.getMessage()));
        }
    }
}
