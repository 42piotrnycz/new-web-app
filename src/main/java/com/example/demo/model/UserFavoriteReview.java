package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "userFavoriteReviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoriteReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favoriteID")
    private Integer favoriteId;

    @Column(name = "userID", nullable = false)
    private Integer userId;

    @Column(name = "reviewID", nullable = false)
    private Integer reviewId;

    public UserFavoriteReview(Integer userId, Integer reviewId) {
        this.userId = userId;
        this.reviewId = reviewId;
    }
}
