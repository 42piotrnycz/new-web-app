import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Alert, CircularProgress, Box, Chip
} from '@mui/material';

const ReviewLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReviewLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('/api/logs/reviews', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setLogs(await response.json());
            } else {
                setError('Failed to fetch review logs');
            }
        } catch (err) {
            setError('Error loading review logs: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviewLogs();
    }, [fetchReviewLogs]);

    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    const getOperationColor = (operation) => {
        switch (operation.toLowerCase()) {
            case 'create':
            case 'created':
                return 'success';
            case 'update':
            case 'updated':
            case 'edit':
            case 'edited':
                return 'info';
            case 'delete':
            case 'deleted':
                return 'error';
            case 'view':
            case 'viewed':
                return 'primary';
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
                Review Activity Logs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monitor review creation, updates, and deletion activities
            </Typography>

            {logs.length === 0 ? (
                <Alert severity="info">No review logs found.</Alert>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Log ID</strong></TableCell>
                                <TableCell><strong>Review ID</strong></TableCell>
                                <TableCell><strong>Operation</strong></TableCell>
                                <TableCell><strong>Date & Time</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.logID} hover>
                                    <TableCell>{log.logID}</TableCell>
                                    <TableCell>{log.reviewID}</TableCell>
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

export default ReviewLogs;
