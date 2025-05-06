package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"reviewID\"", nullable = false)
    private Integer reviewID;

    @Column(name = "\"userID\"", nullable = false)
    private Integer userID;

    @Column(name = "\"contentType\"", nullable = false)
    private String contentType;

    @Column(name = "\"contentTitle\"", nullable = false)
    private String contentTitle;

    @Column(name = "\"reviewTitle\"")
    private String reviewTitle;

    @Column(name = "\"reviewDescription\"", nullable = false)
    private String reviewDescription;

    @Column(name = "\"coverFile\"")
    private String coverFile;

    public Review(Integer userID, String contentType, String contentTitle, String reviewTitle, String reviewDescription, String coverFile) {
        this.userID = userID;
        this.contentType = contentType;
        this.contentTitle = contentTitle;
        this.reviewTitle = reviewTitle;
        this.reviewDescription = reviewDescription;
        this.coverFile = coverFile;
    }
}
