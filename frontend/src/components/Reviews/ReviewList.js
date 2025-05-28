import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Typography
} from '@mui/material';
import { fetchWithSessionCheck } from '../../utils/sessionUtils';
import LoadingState from '../UI/LoadingState';
import ContentFilter from '../UI/ContentFilter';
import ReviewGrid from '../UI/ReviewGrid';

const CONTENT_TYPES = ['All', 'movie', 'tvseries', 'game', 'book'];

const ReviewList = ({ userId: propsUserId }) => {
    const { userId: paramsUserId } = useParams();
    const userId = paramsUserId || propsUserId;
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const response = await fetchWithSessionCheck(`/api/users/${userId}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        const fetchReviews = async () => {
            if (!userId) return;
            try {
                const response = await fetchWithSessionCheck(`/api/reviews/user/${userId}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                }); const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch reviews');
                }

                setReviews(data);
                setFilteredReviews(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchUser();
        fetchReviews();
    }, [userId]);

    useEffect(() => {
        if (!reviews) return;

        if (selectedType === 'All') {
            setFilteredReviews(reviews);
        } else {
            const filtered = reviews.filter(review =>
                review.contentType.toLowerCase() === selectedType.toLowerCase()
            );
            setFilteredReviews(filtered);
        }
    }, [selectedType, reviews]);

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setSelectedType(newType);
        }
    };

    const handleReviewClick = (reviewId) => {
        navigate(`/review/${reviewId}`);
    }; const isEmpty = reviews.length === 0;
    const emptyMessage = "No reviews found. Create your first review!";

    return (
        <>
            <LoadingState
                loading={loading}
                error={error}
                isEmpty={isEmpty}
                emptyMessage={emptyMessage}
            />

            {!loading && !error && !isEmpty && (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {paramsUserId ? `${username}'s Reviews` : 'My Reviews'}
                    </Typography>

                    <ContentFilter
                        selectedType={selectedType}
                        onTypeChange={handleTypeChange}
                        contentTypes={CONTENT_TYPES}
                    />

                    <ReviewGrid
                        reviews={filteredReviews}
                        onReviewClick={handleReviewClick}
                        noResultsMessage="No reviews found for this category."
                    />
                </Container>
            )}
        </>
    );
};

export default ReviewList;
