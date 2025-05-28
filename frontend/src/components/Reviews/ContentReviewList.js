import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { fetchWithSessionCheck } from '../../utils/sessionUtils';
import LoadingState from '../UI/LoadingState';
import ReviewGrid from '../UI/ReviewGrid';

const ContentReviewList = () => {
    const { contentTitle } = useParams();
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            if (!contentTitle) return;
            try {
                const encodedTitle = encodeURIComponent(contentTitle);
                const response = await fetchWithSessionCheck(`/api/reviews/content?title=${encodedTitle}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                }); const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch reviews');
                }

                setReviews(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchReviews();
    }, [contentTitle]);

    const handleReviewClick = (reviewId) => {
        navigate(`/review/${reviewId}`);
    };

    const isEmpty = reviews.length === 0;
    const emptyMessage = `No reviews found for "${contentTitle}"`;

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
                        Reviews for "{contentTitle}"
                    </Typography>

                    <ReviewGrid
                        reviews={reviews}
                        onReviewClick={handleReviewClick}
                    />
                </Container>
            )}
        </>
    );
};

export default ContentReviewList;
