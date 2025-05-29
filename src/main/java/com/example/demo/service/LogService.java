package com.example.demo.service;

import com.example.demo.model.AdminLog;
import com.example.demo.model.ReviewLog;
import com.example.demo.model.UserLog;
import com.example.demo.repository.AdminLogRepository;
import com.example.demo.repository.ReviewLogRepository;
import com.example.demo.repository.UserLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {
    private final UserLogRepository userLogRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final AdminLogRepository adminLogRepository;

    public void logUserActivity(Integer userID, String operation) {
        try {
            UserLog userLog = new UserLog(null, userID, operation, ZonedDateTime.now());
            userLogRepository.save(userLog);
            log.debug("Logged user activity: User {} performed {}", userID, operation);
        } catch (Exception e) {
            log.error("Failed to log user activity: User {} operation {}", userID, operation, e);
        }
    }

    public void logReviewActivity(Integer reviewID, String operation) {
        try {
            Integer nextLogId = getNextReviewLogId();
            ReviewLog reviewLog = new ReviewLog(nextLogId, reviewID, operation, ZonedDateTime.now());
            reviewLogRepository.save(reviewLog);
            log.debug("Logged review activity: Review {} performed {}", reviewID, operation);
        } catch (Exception e) {
            log.error("Failed to log review activity: Review {} operation {}", reviewID, operation, e);
        }
    }

    public void logAdminActivity(Integer adminUserID, String operation) {
        try {
            AdminLog adminLog = new AdminLog(null, adminUserID, operation, ZonedDateTime.now());
            adminLogRepository.save(adminLog);
            log.debug("Logged admin activity: Admin {} performed {}", adminUserID, operation);
        } catch (Exception e) {
            log.error("Failed to log admin activity: Admin {} operation {}", adminUserID, operation, e);
        }
    }

    private Integer getNextReviewLogId() {
        try {
            return reviewLogRepository.findAll()
                    .stream()
                    .mapToInt(ReviewLog::getLogID)
                    .max()
                    .orElse(0) + 1;
        } catch (Exception e) {
            log.warn("Could not determine next review log ID, using timestamp-based ID", e);
            return (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserLog> getAllUserLogs() {
        return userLogRepository.findAllOrderByDateDesc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<ReviewLog> getAllReviewLogs() {
        return reviewLogRepository.findAllOrderByDateDesc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminLog> getAllAdminLogs() {
        return adminLogRepository.findAllOrderByDateDesc();
    }
}
