import React, {useEffect, useState} from 'react';
import {favoritesAPI} from '../../services/favorites';
import './FavoriteButton.css';

const FavoriteButton = ({reviewId, className = '', onFavoriteChange}) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const [statusResponse, countResponse] = await Promise.all([
                    favoritesAPI.checkFavoriteStatus(reviewId),
                    favoritesAPI.getFavoriteCount(reviewId)
                ]);

                setIsFavorited(statusResponse.isFavorited);
                setFavoriteCount(countResponse.favoriteCount);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        if (reviewId) {
            checkFavoriteStatus();
        }
    }, [reviewId]);
    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        try {
            const response = await favoritesAPI.toggleFavorite(reviewId);
            setIsFavorited(response.isFavorited);

            setFavoriteCount(prevCount =>
                response.isFavorited ? prevCount + 1 : prevCount - 1
            );

            if (onFavoriteChange && !response.isFavorited) {
                onFavoriteChange(reviewId);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                alert('Please log in to favorite reviews');
            } else {
                alert('Failed to update favorite status');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`favorite-button-container ${className}`}>
            <button
                className={`favorite-button ${isFavorited ? 'favorited' : ''} ${loading ? 'loading' : ''}`}
                onClick={handleToggleFavorite}
                disabled={loading}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
        <span className="heart-icon">
          {isFavorited ? '❤️' : '🤍'}
        </span>
            </button>
            {favoriteCount > 0 && (
                <span className="favorite-count">{favoriteCount}</span>
            )}
        </div>
    );
};

export default FavoriteButton;
