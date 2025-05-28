import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Box, Card, CardContent, CardMedia, CircularProgress, Container, Grid, Typography} from '@mui/material';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

const CARD_HEIGHT = 500;
const CARD_WIDTH = 345;
const IMAGE_HEIGHT = 200;

const ContentReviewList = () => {
    const {contentTitle} = useParams();
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

        setLoading(true);
        fetchReviews();
    }, [contentTitle]);

    const handleReviewClick = (reviewId) => {
        navigate(`/review/${reviewId}`);
    };

    if (loading) {
        return (
            <Container sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (reviews.length === 0) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="info">No reviews found for "{contentTitle}"</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Reviews for "{contentTitle}"
            </Typography>

            <Grid container spacing={3} sx={{display: 'flex', justifyContent: 'flex-start'}}>
                {reviews.map(review => (
                    <Grid item key={review.reviewID} sx={{width: CARD_WIDTH, m: 1}}>
                        <Card
                            sx={{
                                width: CARD_WIDTH,
                                height: CARD_HEIGHT,
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
                            <CardContent sx={{p: 2, pb: 0, flex: '0 0 auto'}}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 1,
                                        textTransform: 'uppercase',
                                        height: 24
                                    }}
                                >
                                    {review.contentType}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    component="h2"
                                    sx={{
                                        mb: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.2,
                                        height: 48
                                    }}
                                >
                                    {review.contentTitle}
                                </Typography>
                            </CardContent>

                            <Box sx={{width: '100%', height: IMAGE_HEIGHT, position: 'relative'}}>
                                {review.coverFile ? (
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'cover'
                                        }}
                                        image={`/uploads/${review.coverFile}`}
                                        alt={review.contentTitle}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'grey.200',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        <Typography>No image available</Typography>
                                    </Box>
                                )}
                            </Box>

                            <CardContent sx={{p: 2, pt: 1, flex: '1 0 auto'}}>
                                {review.reviewTitle && (
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        sx={{
                                            mb: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.2,
                                            height: 24
                                        }}
                                    >
                                        {review.reviewTitle}
                                    </Typography>
                                )}
                                <Typography
                                    variant="body1"
                                    color="text.primary"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical',
                                        height: 96
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

export default ContentReviewList;
