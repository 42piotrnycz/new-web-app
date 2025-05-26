package com.example.demo.service;

import com.example.demo.model.UserLog;
import com.example.demo.model.ReviewLog;
import com.example.demo.model.AdminLog;
import com.example.demo.repository.UserLogRepository;
import com.example.demo.repository.ReviewLogRepository;
import com.example.demo.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {

    private final UserLogRepository userLogRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final AdminLogRepository adminLogRepository;

    /**
     * Log user activity
     */
    public void logUserActivity(Integer userID, String operation) {
        try {
            UserLog userLog = new UserLog();
            userLog.setUserID(userID);
            userLog.setOperation(operation);
            userLog.setDate(ZonedDateTime.now());

            userLogRepository.save(userLog);
            log.debug("Logged user activity: User {} performed {}", userID, operation);
        } catch (Exception e) {
            log.error("Failed to log user activity: User {} operation {}", userID, operation, e);
        }
    }

    /**
     * Log review activity
     */
    public void logReviewActivity(Integer reviewID, String operation) {
        try {
            Integer nextLogId = getNextReviewLogId();

            ReviewLog reviewLog = new ReviewLog();
            reviewLog.setLogID(nextLogId);
            reviewLog.setReviewID(reviewID);
            reviewLog.setOperation(operation);
            reviewLog.setDate(ZonedDateTime.now());

            reviewLogRepository.save(reviewLog);
            log.debug("Logged review activity: Review {} performed {}", reviewID, operation);
        } catch (Exception e) {
            log.error("Failed to log review activity: Review {} operation {}", reviewID, operation, e);
        }
    }

    /**
     * Log admin activity
     */
    public void logAdminActivity(Integer adminUserID, String operation) {
        try {
            AdminLog adminLog = new AdminLog();
            adminLog.setUserID(adminUserID);
            adminLog.setOperation(operation);
            adminLog.setDate(ZonedDateTime.now());

            adminLogRepository.save(adminLog);
            log.debug("Logged admin activity: Admin {} performed {}", adminUserID, operation);
        } catch (Exception e) {
            log.error("Failed to log admin activity: Admin {} operation {}", adminUserID, operation, e);
        }
    }

    /**
     * Get next available review log ID (since it's not auto-generated)
     */
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
}
