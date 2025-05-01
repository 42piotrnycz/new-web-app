package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reviewid")  // poprawione
    private Integer reviewID;

    @Column(name = "userid", nullable = false)  // poprawione
    private Integer userID;

    @Column(name = "content_type", nullable = false)  // poprawione
    private String contentType;

    @Column(name = "content_title", nullable = false)  // poprawione
    private String contentTitle;

    @Column(name = "review_title")  // poprawione
    private String reviewTitle;

    @Column(name = "review_description", nullable = false)  // poprawione
    private String reviewDescription;

    @Column(name = "cover_file")
    private String coverFile;

    // Konstruktory
    public Review() {}

    public Review(Integer userID, String contentType, String contentTitle, String reviewTitle, String reviewDescription) {
        this.userID = userID;
        this.contentType = contentType;
        this.contentTitle = contentTitle;
        this.reviewTitle = reviewTitle;
        this.reviewDescription = reviewDescription;
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

    // Getter i Setter
    public String getCoverFile() {
        return coverFile;
    }

    public void setCoverFile(String coverFile) {
        this.coverFile = coverFile;
    }

}
