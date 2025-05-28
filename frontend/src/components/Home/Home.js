import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithSessionCheck } from '../../services/auth';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';

const CARD_HEIGHT = 500;
const CARD_WIDTH = 345;
const IMAGE_HEIGHT = 200;

const CONTENT_TYPES = ['All', 'movie', 'tvseries', 'game', 'book'];

const Home = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewUsernames, setReviewUsernames] = useState({});
    const [selectedType, setSelectedType] = useState('All');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchLatestReviews = async () => {
            try {
                const response = await fetchWithSessionCheck('/api/reviews/latest', {
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
                setFilteredReviews(data);

                const usernamePromises = data.map(review =>
                    fetchWithSessionCheck(`/api/users/${review.userID}`, {
                        headers: {
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Welcome to REviewer 2.0
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Latest Reviews
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={selectedType}
                    exclusive
                    onChange={handleTypeChange}
                    aria-label="content type"
                    color="primary"
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            px: 3
                        }
                    }}
                >
                    {CONTENT_TYPES.map((type) => (
                        <ToggleButton
                            key={type}
                            value={type}
                        >
                            {type}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <Grid container
                spacing={3}
                justifyContent="center"
                columns={{ xs: 2, sm: 8, md: 12, lg: 16 }}
            >
                {filteredReviews.length === 0 ? (
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Alert severity="info">No reviews found for this category.</Alert>
                    </Box>
                ) : (
                    filteredReviews.map(review => (
                        <Grid
                            item
                            key={review.reviewID}
                            xs={2}
                            sm={4}
                            md={4}
                            lg={4}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >                            <Card
                            sx={{
                                width: '100%',
                                maxWidth: '345px',
                                minWidth: '345px',
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
                                <CardContent sx={{ p: 2, pb: 0, flex: '0 0 auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                textTransform: 'uppercase',
                                                height: 24
                                            }}
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
                                <Box sx={{
                                    width: '100%',
                                    height: IMAGE_HEIGHT,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {review.coverFile ? (
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center'
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

                                <CardContent sx={{ p: 2, pt: 1, flex: '1 0 auto' }}>
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
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default Home;
