import React, { useState, useEffect } from 'react';

const ReviewList = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/reviews/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchReviews();
    }, [userId]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (reviews.length === 0) {
        return <div>No reviews found.</div>;
    }

    return (
        <div className="reviews-list">
            {reviews.map(review => (
                <div key={review.reviewID} className="review-item">
                    <h3>{review.reviewTitle}</h3>
                    <p>{review.reviewDescription}</p>
                    <p>Type: {review.contentType}</p>
                    <p>Content Title: {review.contentTitle}</p>
                    {review.coverFile && (
                        <img 
                            src={`/uploads/${review.coverFile}`} 
                            alt="Review cover" 
                            width="150"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
