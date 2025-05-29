package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
