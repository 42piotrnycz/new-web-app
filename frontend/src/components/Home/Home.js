import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Button
} from '@mui/material';

const Home = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewUsernames, setReviewUsernames] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLatestReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/reviews/latest', {
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

                // Fetch usernames for all reviews
                const usernamePromises = data.map(review => 
                    fetch(`/api/users/${review.userID}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }).then(res => res.json())
                );

                const users = await Promise.all(usernamePromises);
                const usernameMap = {};
                data.forEach((review, index) => {
                    usernameMap[review.userID] = users[index].username;
                });
                setReviewUsernames(usernameMap);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestReviews();
    }, []);

    const handleReviewClick = (reviewId) => {
        navigate(`/review/${reviewId}`);
    };

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

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Welcome to REviewer 2.0
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Latest Reviews
            </Typography>
            <Grid container spacing={3}>
                {reviews.map(review => (
                    <Grid item xs={12} sm={6} md={4} key={review.reviewID}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'scale(1.02)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                            onClick={() => handleReviewClick(review.reviewID)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ textTransform: 'uppercase' }}
                                    >
                                        {review.contentType}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        component={Button}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/user/${review.userID}/reviews`);
                                        }}
                                        sx={{ 
                                            textTransform: 'none',
                                            p: 0,
                                            minWidth: 'auto',
                                            '&:hover': {
                                                background: 'none',
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        by {reviewUsernames[review.userID] || '...'}
                                    </Typography>
                                </Box>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {review.contentTitle}
                                </Typography>
                            </CardContent>
                            
                            {review.coverFile && (
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 200,
                                        objectFit: 'cover',
                                        width: '100%'
                                    }}
                                    image={`/uploads/${review.coverFile}`}
                                    alt={review.contentTitle}
                                />
                            )}
                            
                            <CardContent sx={{ flexGrow: 1 }}>
                                {review.reviewTitle && (
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {review.reviewTitle}
                                    </Typography>
                                )}
                                <Typography 
                                    variant="body1" 
                                    color="text.primary" 
                                    sx={{ 
                                        whiteSpace: 'pre-line',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical'
                                    }}
                                >
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

export default Home;
