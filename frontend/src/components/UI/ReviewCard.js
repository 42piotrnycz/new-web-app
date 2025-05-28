import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button
} from '@mui/material';

const CARD_HEIGHT = 500;
const IMAGE_HEIGHT = 200;

/**
 * review card component that displays review information in a consistent format
 */
const ReviewCard = ({
    review,
    onClick,
    onUserClick,
    username,
    showUsername = false
}) => {
    const handleUserClick = (e) => {
        if (onUserClick) {
            e.stopPropagation();
            onUserClick(review.userID);
        }
    };

    return (
        <Card
            sx={{
                width: '100%',
                maxWidth: '345px',
                minWidth: { xs: 'auto', sm: '300px' },
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
            onClick={onClick}
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

                    {showUsername && username && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            component={Button}
                            onClick={handleUserClick}
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
                            by {username || '...'}
                        </Typography>
                    )}
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
    );
};

export default ReviewCard;
