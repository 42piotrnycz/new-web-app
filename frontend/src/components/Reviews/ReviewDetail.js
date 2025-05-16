import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Alert,
    Box,
    Button
} from '@mui/material';

const ReviewDetail = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviewDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/reviews/${reviewId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch review');
                }

                const reviewData = await response.json();
                setReview(reviewData);

                // Fetch user details
                const userResponse = await fetch(`/api/users/${reviewData.userID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const userData = await userResponse.json();
                setUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviewDetails();
    }, [reviewId]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!review) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="info">Review not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to={`/user/${user?.id}/reviews`}
                    color="primary"
                    sx={{ textTransform: 'none', fontSize: '1.1rem' }}
                >
                    {user?.username}
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, textTransform: 'uppercase' }}
                    >
                        {review.contentType}
                    </Typography>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {review.contentTitle}
                    </Typography>
                </CardContent>

                {review.coverFile && (
                    <CardMedia
                        component="img"
                        sx={{
                            maxHeight: 400,
                            objectFit: 'contain',
                            bgcolor: 'black'
                        }}
                        image={`/uploads/${review.coverFile}`}
                        alt={review.contentTitle}
                    />
                )}

                <CardContent>
                    {review.reviewTitle && (
                        <Typography variant="h5" component="h2" gutterBottom>
                            {review.reviewTitle}
                        </Typography>
                    )}
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            whiteSpace: 'pre-line',
                            mt: 2,
                            fontSize: '1.1rem',
                            lineHeight: 1.8
                        }}
                    >
                        {review.reviewDescription}
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ReviewDetail;
