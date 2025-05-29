import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';

const NotFound = () => {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
                <Typography variant="h2" component="h1" gutterBottom>
                    404
                </Typography>
                <Typography variant="h4" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px' }}>
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Return to Home Page
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;
