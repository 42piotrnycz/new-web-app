import React from 'react';
import { Typography, Paper } from '@mui/material';

const UserLogs = () => {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2">
                User Logs
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                User logs functionality coming soon...
            </Typography>
        </Paper>
    );
};

export default UserLogs;
