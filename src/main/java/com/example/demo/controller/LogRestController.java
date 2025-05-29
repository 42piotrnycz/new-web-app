package com.example.demo.controller;

import com.example.demo.model.AdminLog;
import com.example.demo.model.ReviewLog;
import com.example.demo.model.UserLog;
import com.example.demo.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Log Management", description = "APIs for viewing system logs")
public class LogRestController {

    private final LogService logService;

    @Operation(summary = "Get All User Logs", description = "Retrieve all user activity logs. Requires admin privileges.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logs retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserLog>> getAllUserLogs() {
        log.info("Admin retrieving all user logs");
        List<UserLog> logs = logService.getAllUserLogs();
        return ResponseEntity.ok(logs);
    }

    @Operation(summary = "Get All Review Logs", description = "Retrieve all review activity logs. Requires admin privileges.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review logs retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @GetMapping("/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewLog>> getAllReviewLogs() {
        log.info("Admin retrieving all review logs");
        List<ReviewLog> logs = logService.getAllReviewLogs();
        return ResponseEntity.ok(logs);
    }

    @Operation(summary = "Get All Admin Logs", description = "Retrieve all admin activity logs. Requires admin privileges.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Admin logs retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminLog>> getAllAdminLogs() {
        log.info("Admin retrieving all admin logs");
        List<AdminLog> logs = logService.getAllAdminLogs();
        return ResponseEntity.ok(logs);
    }
}
