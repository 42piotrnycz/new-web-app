import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUserData();
    }, []);

    if (error) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        My Profile
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Username</Typography>
                        <Typography paragraph>{userData.username}</Typography>

                        <Typography variant="h6">Email</Typography>
                        <Typography paragraph>{userData.email}</Typography>

                        <Typography variant="h6">Role</Typography>
                        <Typography paragraph>{userData.role}</Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Profile;
