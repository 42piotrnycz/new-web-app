package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
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

    // Konstruktory
    public Review() {}

    public Review(Integer userID, String contentType, String contentTitle, String reviewTitle, String reviewDescription, String coverFile) {
        this.userID = userID;
        this.contentType = contentType;
        this.contentTitle = contentTitle;
        this.reviewTitle = reviewTitle;
        this.reviewDescription = reviewDescription;
        this.coverFile = coverFile;
    }

    // Gettery i Settery
    public Integer getReviewID() {
        return reviewID;
    }

    public void setReviewID(Integer reviewID) {
        this.reviewID = reviewID;
    }

    public Integer getUserID() {
        return userID;
    }

    public void setUserID(Integer userID) {
        this.userID = userID;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getContentTitle() {
        return contentTitle;
    }

    public void setContentTitle(String contentTitle) {
        this.contentTitle = contentTitle;
    }

    public String getReviewTitle() {
        return reviewTitle;
    }

    public void setReviewTitle(String reviewTitle) {
        this.reviewTitle = reviewTitle;
    }

    public String getReviewDescription() {
        return reviewDescription;
    }

    public void setReviewDescription(String reviewDescription) {
        this.reviewDescription = reviewDescription;
    }

    public String getCoverFile() {
        return coverFile;
    }

    public void setCoverFile(String coverFile) {
        this.coverFile = coverFile;
    }

}
