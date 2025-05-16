import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, CardMedia, Grid, CircularProgress, Alert } from '@mui/material';

const ReviewList = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/reviews/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch reviews');
                }
                
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchReviews();
        }
    }, [userId]);

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

    if (reviews.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="info">No reviews found. Create your first review!</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Reviews
            </Typography>
            <Grid container spacing={3}>
                {reviews.map(review => (
                    <Grid item xs={12} md={6} lg={4} key={review.reviewID}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {review.coverFile && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={`http://localhost:8080/uploads/${review.coverFile}`}
                                    alt={review.reviewTitle || review.contentTitle}
                                    sx={{ objectFit: 'cover' }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {review.reviewTitle || review.contentTitle}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Type: {review.contentType}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Content: {review.contentTitle}
                                </Typography>
                                <Typography variant="body1">
                                    {review.reviewDescription}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ReviewList;
