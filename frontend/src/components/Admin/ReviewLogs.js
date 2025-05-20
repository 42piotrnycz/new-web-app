import React from 'react';
import { Typography, Paper } from '@mui/material';

const ReviewLogs = () => {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2">
                Review Logs
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Review logs functionality coming soon...
            </Typography>
        </Paper>
    );
};

export default ReviewLogs;
