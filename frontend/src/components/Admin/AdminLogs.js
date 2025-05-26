import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    Box,
    Chip
} from '@mui/material';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdminLogs();
    }, []);

    const fetchAdminLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/logs/admin', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else {
                setError('Failed to fetch admin logs');
            }
        } catch (err) {
            setError('Error loading admin logs: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getOperationColor = (operation) => {
        switch (operation.toLowerCase()) {
            case 'create':
            case 'created':
                return 'success';
            case 'update':
            case 'updated':
                return 'info';
            case 'delete':
            case 'deleted':
                return 'error';
            case 'login':
                return 'primary';
            case 'logout':
                return 'secondary';
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
                Admin Activity Logs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monitor administrative actions performed in the system
            </Typography>

            {logs.length === 0 ? (
                <Alert severity="info">No admin logs found.</Alert>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Log ID</strong></TableCell>
                                <TableCell><strong>Admin User ID</strong></TableCell>
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

export default AdminLogs;
