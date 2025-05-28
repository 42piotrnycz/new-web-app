package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Review Management", description = "APIs for managing reviews including CRUD operations")
public class ReviewRestController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Operation(summary = "Get Reviews by User ID", description = "Retrieve all reviews created by a specific user.", tags = {
            "Review Retrieval"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reviews retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                        {
                            "reviewID": 1,
                            "userID": 1,
                            "contentType": "Movie",
                            "contentTitle": "The Matrix",
                            "reviewTitle": "Great Sci-Fi Movie",
                            "reviewDescription": "Amazing special effects and storyline...",
                            "coverFile": "cover1.jpg"
                        }
                    ]
                    """))),
            @ApiResponse(responseCode = "404", description = "No reviews found for the specified user", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "No reviews found for user ID 1"
                    }
                    """)))
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(
            @Parameter(description = "User ID to get reviews for", required = true, example = "1") @PathVariable Integer userId) {
        List<Review> reviews = reviewRepository.findByUserID(userId);
        return reviews.isEmpty()
                ? ResponseEntity.status(404).body(Map.of("error", "No reviews found for user ID " + userId))
                : ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Get Review by ID", description = "Retrieve a specific review by its unique identifier.", tags = {
            "Review Retrieval"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review found successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "reviewID": 1,
                        "userID": 1,
                        "contentType": "Movie",
                        "contentTitle": "The Matrix",
                        "reviewTitle": "Great Sci-Fi Movie",
                        "reviewDescription": "Amazing special effects and storyline...",
                        "coverFile": "cover1.jpg"
                    }
                    """))),
            @ApiResponse(responseCode = "404", description = "Review not found")
    })
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(
            @Parameter(description = "Review ID", required = true, example = "1") @PathVariable Integer reviewId) {
        return reviewRepository.findById(reviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get Latest Reviews", description = "Retrieve the 25 most recently created reviews.", tags = {
            "Review Retrieval"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Latest reviews retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                        {
                            "reviewID": 25,
                            "userID": 3,
                            "contentType": "Book",
                            "contentTitle": "Dune",
                            "reviewTitle": "Epic Science Fiction",
                            "reviewDescription": "A masterpiece of science fiction literature...",
                            "coverFile": "dune.jpg"
                        },
                        {
                            "reviewID": 24,
                            "userID": 2,
                            "contentType": "Movie",
                            "contentTitle": "Inception",
                            "reviewTitle": "Mind-bending Experience",
                            "reviewDescription": "Christopher Nolan's masterpiece...",
                            "coverFile": "inception.jpg"
                        }
                    ]
                    """)))
    })
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestReviews() {
        List<Review> reviews = reviewRepository.findTop25ByOrderByReviewIDDesc();
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Get Reviews by Content Title", description = "Retrieve all reviews for a specific content title.", tags = {
            "Review Retrieval"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reviews retrieved successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                        {
                            "reviewID": 1,
                            "userID": 1,
                            "contentType": "Movie",
                            "contentTitle": "The Matrix",
                            "reviewTitle": "Great Sci-Fi Movie",
                            "reviewDescription": "Amazing special effects and storyline...",
                            "coverFile": "cover1.jpg"
                        },
                        {
                            "reviewID": 5,
                            "userID": 2,
                            "contentType": "Movie",
                            "contentTitle": "The Matrix",
                            "reviewTitle": "Classic Action Movie",
                            "reviewDescription": "One of the best sci-fi films ever made...",
                            "coverFile": "cover5.jpg"
                        }
                    ]
                    """))),
            @ApiResponse(responseCode = "404", description = "No reviews found for the specified content title", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "No reviews found for content title 'The Matrix'"
                    }
                    """)))
    })
    @GetMapping("/content")
    public ResponseEntity<?> getReviewsByContentTitle(
            @Parameter(description = "Content title to get reviews for", required = true, example = "The Matrix") @RequestParam String title) {
        List<Review> reviews = reviewRepository.findByContentTitleOrderByReviewIDDesc(title);
        return reviews.isEmpty()
                ? ResponseEntity.status(404).body(Map.of("error", "No reviews found for content title '" + title + "'"))
                : ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Create New Review", description = "Create a new review with optional cover image upload. Requires authentication.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Review Management"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review created successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "reviewID": 26,
                        "userID": 1,
                        "contentType": "Movie",
                        "contentTitle": "The Matrix",
                        "reviewTitle": "Great Sci-Fi Movie",
                        "reviewDescription": "Amazing special effects and storyline...",
                        "coverFile": "abc123.jpg"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Invalid request - missing required fields", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Required fields must not be empty"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    @PostMapping
    public ResponseEntity<?> createReview(
            @Parameter(description = "Cover image file (optional)", required = false) @RequestParam(required = false) MultipartFile cover,
            @Parameter(description = "Type of content being reviewed", required = true, example = "Movie") @RequestParam String contentType,
            @Parameter(description = "Title of the content being reviewed", required = true, example = "The Matrix") @RequestParam String contentTitle,
            @Parameter(description = "Title of the review (optional)", required = false, example = "Great Sci-Fi Movie") @RequestParam(required = false) String reviewTitle,
            @Parameter(description = "Review description/content", required = true, example = "Amazing special effects and storyline...") @RequestParam String reviewDescription,
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

                fileName = UUID.randomUUID() + extension;
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

    @Operation(summary = "Update Review", description = "Update an existing review. Only the review owner can update their reviews. Requires authentication.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Review Management"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review updated successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "reviewID": 1,
                        "userID": 1,
                        "contentType": "Movie",
                        "contentTitle": "The Matrix Reloaded",
                        "reviewTitle": "Updated Review Title",
                        "reviewDescription": "Updated review description...",
                        "coverFile": "new-cover.jpg"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid data or file upload error", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "File upload failed"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to update this review", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Not authorized to update this review"
                    }
                    """))),
            @ApiResponse(responseCode = "404", description = "Review not found")
    })
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @Parameter(description = "Review ID to update", required = true, example = "1") @PathVariable Integer reviewId,
            @Parameter(description = "New cover image file (optional)", required = false) @RequestParam(required = false) MultipartFile coverFile,
            @Parameter(description = "Updated content type", required = true, example = "Movie") @RequestParam String contentType,
            @Parameter(description = "Updated content title", required = true, example = "The Matrix Reloaded") @RequestParam String contentTitle,
            @Parameter(description = "Updated review title (optional)", required = false, example = "Updated Review Title") @RequestParam(required = false) String reviewTitle,
            @Parameter(description = "Updated review description", required = true, example = "Updated review description...") @RequestParam String reviewDescription,
            @Parameter(description = "Keep existing cover if no new file provided", required = false, example = "false") @RequestParam(defaultValue = "false") boolean keepExistingCover,
            Principal principal) {
        try {
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            Integer userID = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            // Check if the user is the owner of the review
            if (!review.getUserID().equals(userID)) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to update this review"));
            }

            // Handle cover file
            String fileName = review.getCoverFile(); // Keep existing cover file name by default
            if (!keepExistingCover && coverFile != null && !coverFile.isEmpty()) {
                // Delete old cover file if it exists
                if (review.getCoverFile() != null && !review.getCoverFile().isEmpty()) {
                    File oldCover = new File(new File("uploads").getAbsolutePath(), review.getCoverFile());
                    if (oldCover.exists()) {
                        oldCover.delete();
                    }
                }

                // Save new cover file
                String uploadDir = new File("uploads").getAbsolutePath();
                new File(uploadDir).mkdirs();

                String extension = "";
                String originalFilename = coverFile.getOriginalFilename();
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
                }

                fileName = UUID.randomUUID() + extension;
                coverFile.transferTo(new File(uploadDir, fileName));
            }

            // Update review properties
            review.setContentType(contentType.trim());
            review.setContentTitle(contentTitle.trim());
            review.setReviewTitle(reviewTitle != null ? reviewTitle.trim() : null);
            review.setReviewDescription(reviewDescription.trim());
            if (!keepExistingCover) {
                review.setCoverFile(fileName);
            }

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Delete Review", description = "Delete a review. Only the review owner can delete their reviews. Requires authentication.", security = @SecurityRequirement(name = "bearerAuth"), tags = {
            "Review Management"})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review deleted successfully", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "message": "Review deleted successfully"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to delete this review", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    {
                        "error": "Not authorized to delete this review"
                    }
                    """))),
            @ApiResponse(responseCode = "404", description = "Review not found")
    })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @Parameter(description = "Review ID to delete", required = true, example = "1") @PathVariable Integer reviewId,
            Principal principal) {
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
