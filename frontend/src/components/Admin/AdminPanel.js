import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Tabs,
    Tab,
    Box,
    Paper
} from '@mui/material';
import UserManagement from './UserManagement';
import UserLogs from './UserLogs';
import ReviewLogs from './ReviewLogs';

const AdminPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTab = () => {
        if (location.pathname === '/admin/user-logs') return 1;
        if (location.pathname === '/admin/review-logs') return 2;
        return 0;
    };

    const handleChange = (event, newTab) => {
        switch (newTab) {
            case 1:
                navigate('/admin/user-logs');
                break;
            case 2:
                navigate('/admin/review-logs');
                break;
            default:
                navigate('/admin');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Admin Panel
            </Typography>

            <Paper sx={{ mt: 3 }}>                <Tabs
                value={currentTab()}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="User Management" />
                <Tab label="User Logs" />
                <Tab label="Review Logs" />
            </Tabs>

                <Box sx={{ p: 3 }}>
                    <Routes>
                        <Route index element={<UserManagement />} />
                        <Route path="user-logs" element={<UserLogs />} />
                        <Route path="review-logs" element={<ReviewLogs />} />
                    </Routes>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminPanel;
