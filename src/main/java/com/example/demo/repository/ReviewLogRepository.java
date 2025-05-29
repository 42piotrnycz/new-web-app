package com.example.demo.repository;

import com.example.demo.model.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewLogRepository extends JpaRepository<ReviewLog, Integer> {

    List<ReviewLog> findByReviewIDOrderByDateDesc(Integer reviewID);

    @Query("SELECT rl FROM ReviewLog rl ORDER BY rl.date DESC")
    List<ReviewLog> findAllOrderByDateDesc();
}
