package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "reviewLogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewLog {

    @Id
    @Column(name = "logID")
    private Integer logID;

    @Column(name = "reviewID", nullable = false)
    private Integer reviewID;

    @Column(name = "operation", nullable = false)
    private String operation;

    @Column(name = "date", nullable = false)
    private ZonedDateTime date;
}
