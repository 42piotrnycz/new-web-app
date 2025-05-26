package com.example.demo.repository;

import com.example.demo.model.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Integer> {

    List<AdminLog> findByUserIDOrderByDateDesc(Integer userID);

    @Query("SELECT al FROM AdminLog al ORDER BY al.date DESC")
    List<AdminLog> findAllOrderByDateDesc();
}
