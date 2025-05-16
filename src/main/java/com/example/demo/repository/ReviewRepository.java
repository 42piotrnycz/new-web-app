package com.example.demo.repository;

import com.example.demo.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByUserID(Integer userID);
    List<Review> findTop25ByOrderByReviewIDDesc();
}
