package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "adminLogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "logID")
    private Integer logID;

    @Column(name = "userID", nullable = false)
    private Integer userID;

    @Column(name = "operation", nullable = false)
    private String operation;

    @Column(name = "date", nullable = false)
    private ZonedDateTime date;
}
