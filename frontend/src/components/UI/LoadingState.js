import React from 'react';
import {Alert, CircularProgress, Container} from '@mui/material';

/**
 * Component to handle loading states, errors, and empty states
 */
const LoadingState = ({
                          loading,
                          error,
                          isEmpty = false,
                          emptyMessage = "No data available."
                      }) => {
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

    if (isEmpty) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="info">{emptyMessage}</Alert>
            </Container>
        );
    }

    return null;
};

export default LoadingState;
