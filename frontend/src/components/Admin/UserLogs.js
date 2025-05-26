import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Alert, CircularProgress, Box, Chip
} from '@mui/material';

const UserLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUserLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('/api/logs/users', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setLogs(await response.json());
            } else {
                setError('Failed to fetch user logs');
            }
        } catch (err) {
            setError('Error loading user logs: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserLogs();
    }, [fetchUserLogs]);const formatDate = (dateString) => new Date(dateString).toLocaleString();

    const getOperationColor = (operation) => {
        switch (operation.toLowerCase()) {
            case 'register':
            case 'registered':
                return 'success';
            case 'login':
                return 'primary';
            case 'logout':
                return 'secondary';
            case 'profile_update':
            case 'updated':
                return 'info';
            case 'delete':
            case 'deleted':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                User Activity Logs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monitor user registration, login, and profile activities
            </Typography>

            {logs.length === 0 ? (
                <Alert severity="info">No user logs found.</Alert>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Log ID</strong></TableCell>
                                <TableCell><strong>User ID</strong></TableCell>
                                <TableCell><strong>Operation</strong></TableCell>
                                <TableCell><strong>Date & Time</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.logID} hover>
                                    <TableCell>{log.logID}</TableCell>
                                    <TableCell>{log.userID}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.operation}
                                            color={getOperationColor(log.operation)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(log.date)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default UserLogs;
