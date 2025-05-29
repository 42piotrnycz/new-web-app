package com.example.demo.repository;

import com.example.demo.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLogRepository extends JpaRepository<UserLog, Integer> {

    List<UserLog> findByUserIDOrderByDateDesc(Integer userID);

    @Query("SELECT ul FROM UserLog ul ORDER BY ul.date DESC")
    List<UserLog> findAllOrderByDateDesc();
}
