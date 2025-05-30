import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';
import FavoriteButton from '../UI/FavoriteButton';

const ReviewDetail = () => {
    const {reviewId} = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [success, setSuccess] = useState(null);
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetchWithSessionCheck('/api/users/me', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    const userData = await response.json();

                    if (userData && userData.id) {
                        userData.id = Number(userData.id);
                    }

                    setCurrentUser(userData);
                }
            } catch (err) {
                console.error('Error fetching current user:', err);
            }
        };

        const fetchReviewDetails = async () => {
            try {
                const response = await fetchWithSessionCheck(`/api/reviews/${reviewId}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch review');
                }

                const reviewData = await response.json();

                if (reviewData && reviewData.userID) {
                    reviewData.userID = Number(reviewData.userID);
                }

                setReview(reviewData);

                const userResponse = await fetchWithSessionCheck(`/api/users/${reviewData.userID}`, {
                    headers: {
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

        fetchCurrentUser();
        fetchReviewDetails();
    }, [reviewId]);
    const handleDelete = async () => {
        try {
            const response = await fetchWithSessionCheck(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete review');
            }

            setSuccess('Review deleted successfully');
            setTimeout(() => {
                navigate('/reviews');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
        setDeleteDialogOpen(false);
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

    if (!review) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="info">Review not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
            <Box sx={{mb: 3}}>
                <Button
                    component={Link}
                    to={`/user/${user?.id}/reviews`}
                    color="primary"
                    sx={{textTransform: 'none', fontSize: '1.1rem'}}
                >
                    {user?.username}
                </Button>
            </Box> {success && (
            <Alert severity="success" sx={{mb: 2}}>
                {success}
            </Alert>
        )} <Card>
            <CardContent>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <Box sx={{flex: 1}}>
                        {currentUser && (
                            <>                            {(Number(currentUser.id) === Number(review.userID) || currentUser.role === 'ROLE_ADMIN') && (
                                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate(`/review/edit/${reviewId}`)}
                                    >
                                        {currentUser.role === 'ROLE_ADMIN' && Number(currentUser.id) !== Number(review.userID) ? 'ADMIN: EDIT REVIEW' : 'Edit Review'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        {currentUser.role === 'ROLE_ADMIN' && Number(currentUser.id) !== Number(review.userID) ? 'ADMIN: DELETE REVIEW' : 'Delete Review'}
                                    </Button>
                                </Box>
                            )}
                            </>
                        )}                        </Box>
                    {currentUser && review && Number(currentUser.id) !== Number(review.userID) && (
                        <FavoriteButton reviewId={Number(reviewId)}/>
                    )}
                </Box><Typography
                variant="body2"
                color="text.secondary"
                sx={{mb: 1, textTransform: 'uppercase'}}
            >
                {review.contentType}
            </Typography>
                <Typography
                    variant="h4"
                    component={Link}
                    to={`/content/${encodeURIComponent(review.contentTitle)}`}
                    sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.main'
                        },
                        cursor: 'pointer',
                        display: 'block'
                    }}
                    gutterBottom
                >
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
            </CardContent> </Card>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete Review</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this review? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReviewDetail;
