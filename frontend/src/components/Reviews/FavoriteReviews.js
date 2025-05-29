import React, {useEffect, useState} from 'react';
import {favoritesAPI} from '../../services/favorites';
import ReviewCard from '../UI/ReviewCard';
import LoadingState from '../UI/LoadingState';
import './FavoriteReviews.css';

const FavoriteReviews = () => {
    const [favoriteReviews, setFavoriteReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchFavoriteReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const reviews = await favoritesAPI.getUserFavorites();
                setFavoriteReviews(reviews);
            } catch (error) {
                console.error('Error fetching favorite reviews:', error);
                if (error.message.includes('401') || error.message.includes('unauthorized')) {
                    setError('Please log in to view your favorite reviews');
                } else {
                    setError('Failed to load favorite reviews');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteReviews();
    }, []);
    const handleReviewUpdate = (updatedReview) => {
        setFavoriteReviews(prevReviews =>
            prevReviews.map(review =>
                review.reviewID === updatedReview.reviewID ? updatedReview : review
            )
        );
    };

    const handleReviewDelete = (deletedReviewId) => {
        setFavoriteReviews(prevReviews =>
            prevReviews.filter(review => review.reviewID !== deletedReviewId)
        );
    };

    const handleFavoriteRemove = (reviewId) => {
        setFavoriteReviews(prevReviews =>
            prevReviews.filter(review => review.reviewID !== reviewId)
        );
    };

    if (loading) {
        return (
            <div className="favorite-reviews-container">
                <div className="favorite-reviews-header">
                    <h1>My Favorite Reviews</h1>
                </div>
                <LoadingState message="Loading your favorite reviews..."/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="favorite-reviews-container">
                <div className="favorite-reviews-header">
                    <h1>My Favorite Reviews</h1>
                </div>
                <div className="error-message">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorite-reviews-container">
            <div className="favorite-reviews-header">
                <h1>My Favorite Reviews</h1>
                <p className="favorite-count">
                    {favoriteReviews.length === 0
                        ? 'No favorite reviews yet'
                        : `${favoriteReviews.length} favorite review${favoriteReviews.length !== 1 ? 's' : ''}`
                    }
                </p>
            </div>

            {favoriteReviews.length === 0 ? (
                <div className="no-favorites">
                    <div className="no-favorites-icon">🤍</div>
                    <h3>No favorite reviews yet</h3>
                    <p>Start exploring reviews and click the heart icon to add them to your favorites!</p>
                </div>
            ) : (<div className="favorite-reviews-grid">
                    {favoriteReviews.map(review => (
                        <ReviewCard
                            key={review.reviewID}
                            review={review}
                            onUpdate={handleReviewUpdate}
                            onDelete={handleReviewDelete}
                            onFavoriteChange={handleFavoriteRemove}
                            showFavoriteButton={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoriteReviews;
