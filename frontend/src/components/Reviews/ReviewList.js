import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Box,
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
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

const CARD_HEIGHT = 500;
const CARD_WIDTH = 345;
const IMAGE_HEIGHT = 200;

const CONTENT_TYPES = ['All', 'movie', 'tvseries', 'game', 'book'];

const ReviewList = ({userId: propsUserId}) => {
    const {userId: paramsUserId} = useParams();
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
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch reviews');
                }

                const data = await response.json();
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
                <Alert severity="info">No reviews found. Create your first review!</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
            <Typography variant="h4" component="h1" gutterBottom>
                {paramsUserId ? `${username}'s Reviews` : 'My Reviews'}
            </Typography> <Box sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            overflow: 'auto'
        }}>
            <ToggleButtonGroup
                value={selectedType}
                exclusive
                onChange={handleTypeChange}
                aria-label="content type"
                color="primary"
                sx={{
                    flexWrap: {xs: 'nowrap', md: 'wrap'},
                    '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        px: {xs: 2, sm: 3},
                        minWidth: {xs: 'auto', sm: 'auto'},
                        fontSize: {xs: '0.8rem', sm: '0.875rem'}
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
        </Box><Grid
            container
            spacing={3}
            justifyContent="center"
            columns={{xs: 2, sm: 8, md: 12, lg: 16}}
        >
            {filteredReviews.length === 0 ? (
                <Box sx={{width: '100%', mt: 2, display: 'flex', justifyContent: 'center'}}>
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
                        sx={{display: 'flex', justifyContent: 'center'}}
                    > <Card
                        sx={{
                            width: '100%',
                            maxWidth: '345px',
                            minWidth: {xs: 'auto', sm: '300px'},
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
                        </CardContent> <Box sx={{
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
                ))
            )}
        </Grid>
        </Container>
    );
};

export default ReviewList;
