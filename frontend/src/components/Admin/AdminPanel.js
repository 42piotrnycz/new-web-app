import React from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {Box, Container, Paper, Tab, Tabs, Typography} from '@mui/material';
import UserManagement from './UserManagement';
import UserLogs from './UserLogs';
import ReviewLogs from './ReviewLogs';
import AdminLogs from './AdminLogs';

const AdminPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTab = () => {
        if (location.pathname === '/admin/user-logs') return 1;
        if (location.pathname === '/admin/review-logs') return 2;
        if (location.pathname === '/admin/admin-logs') return 3;
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
            case 3:
                navigate('/admin/admin-logs');
                break;
            default:
                navigate('/admin');
        }
    };    return (
        <Container 
            maxWidth="lg" 
            sx={{
                mt: { xs: 2, sm: 3, md: 4 }, 
                px: { xs: 1, sm: 2, md: 3 },
                width: '100%'
            }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                align="center"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
            >
                Admin Panel
            </Typography>
            <Paper 
                sx={{
                    mt: { xs: 2, sm: 3 }, 
                    width: '100%', 
                    overflow: 'hidden',
                    borderRadius: { xs: '4px', sm: '8px' },
                    boxShadow: { xs: 1, sm: 2, md: 3 }
                }}>                <Tabs
                    value={currentTab()}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered={false}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            minWidth: { xs: 'auto', sm: 80 },
                            padding: { xs: '6px 8px', sm: '12px 16px' }
                        }
                    }}
                >
                    <Tab label="User Management"/>
                    <Tab label="User Logs"/>
                    <Tab label="Review Logs"/>
                    <Tab label="Admin Logs"/> 
                </Tabs>                <Box 
                    sx={{
                        p: { xs: 1, sm: 2, md: 3 },
                        maxHeight: { xs: 'calc(100vh - 200px)', sm: 'auto' },
                        overflowY: { xs: 'auto', sm: 'visible' },
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch', // Better scrolling on iOS
                        '-webkit-overflow-scrolling': 'touch' // For older iOS devices
                    }}
                >
                    <Routes>
                        <Route index element={<UserManagement/>}/>
                        <Route path="user-logs" element={<UserLogs/>}/>
                        <Route path="review-logs" element={<ReviewLogs/>}/>
                        <Route path="admin-logs" element={<AdminLogs/>}/>
                    </Routes>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminPanel;
