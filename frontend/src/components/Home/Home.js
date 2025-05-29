import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {fetchWithSessionCheck} from '../../services/auth';
import {Container, Typography} from '@mui/material';
import LoadingState from '../UI/LoadingState';
import ContentFilter from '../UI/ContentFilter';
import ReviewGrid from '../UI/ReviewGrid';

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
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch reviews');
                }

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
    return (
        <>
            <LoadingState
                loading={loading}
                error={error}
            />

            {!loading && !error && (
                <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{mb: 4}}>
                        Welcome to REviewer 2.0
                    </Typography>
                    <Typography variant="h5" component="h2" gutterBottom sx={{mb: 3}}>
                        Latest Reviews
                    </Typography>

                    <ContentFilter
                        selectedType={selectedType}
                        onTypeChange={handleTypeChange}
                        contentTypes={CONTENT_TYPES}
                    />

                    <ReviewGrid
                        reviews={filteredReviews}
                        onReviewClick={handleReviewClick}
                        onUserClick={(userId) => navigate(`/user/${userId}/reviews`)}
                        usernames={reviewUsernames}
                        showUsernames={true}
                        noResultsMessage="No reviews found for this category."
                    /> </Container>
            )}
        </>
    );
};

export default Home;
