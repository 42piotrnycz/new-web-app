import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [success, setSuccess] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetchWithSessionCheck('/api/users/me', {
                    headers: {
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
    const handleDeleteProfile = async () => {
        try {
            const response = await fetchWithSessionCheck(`/api/users/${userData.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete profile');
            }

            const result = await response.json();
            setSuccess('Profile deleted successfully. Redirecting to login...');

            localStorage.removeItem('token');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
        setDeleteDialogOpen(false);
    };

    if (error) {
        return (
            <Container maxWidth="sm">
                <Box sx={{mt: 4}}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container maxWidth="sm">
                <Box sx={{mt: 4}}>
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }
    return (
        <Container maxWidth="sm">
            <Box sx={{mt: 4}}>
                {success && (
                    <Alert severity="success" sx={{mb: 2}}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{p: 3}}>
                    <Typography variant="h4" gutterBottom>
                        My Profile
                    </Typography>
                    <Box sx={{mt: 2}}>
                        <Typography variant="h6">Username</Typography>
                        <Typography paragraph>{userData.username}</Typography>

                        <Typography variant="h6">Email</Typography>
                        <Typography paragraph>{userData.email}</Typography>

                        <Typography variant="h6">Role</Typography>
                        <Typography paragraph>{userData.role}</Typography>

                        {userData.role !== 'ROLE_ADMIN' && (
                            <Box sx={{mt: 3}}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    Delete Profile
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Paper>

                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm Delete Profile</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete your profile? This will delete all your reviews and cannot be
                        undone.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteProfile} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default Profile;
