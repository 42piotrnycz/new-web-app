import React from 'react';
import { Grid, Box, Alert } from '@mui/material';
import ReviewCard from './ReviewCard';

/**
 * Grid layout for reviews that ensures consistent display across different screen sizes
 */
const ReviewGrid = ({
    reviews,
    onReviewClick,
    onUserClick,
    usernames = {},
    showUsernames = false,
    noResultsMessage = "No reviews found for this category."
}) => {
    if (reviews.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Alert severity="info">{noResultsMessage}</Alert>
            </Box>
        );
    }

    return (
        <Grid
            container
            spacing={3}
            justifyContent="center"
            columns={{ xs: 2, sm: 8, md: 12, lg: 16 }}
        >
            {reviews.map(review => (
                <Grid
                    item
                    key={review.reviewID}
                    xs={2}
                    sm={4}
                    md={4}
                    lg={4}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                >
                    <ReviewCard
                        review={review}
                        onClick={() => onReviewClick(review.reviewID)}
                        onUserClick={onUserClick}
                        username={usernames[review.userID]}
                        showUsername={showUsernames}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ReviewGrid;
