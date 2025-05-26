package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "userLogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLog {

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
