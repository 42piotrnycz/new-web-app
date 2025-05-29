import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

const ReviewLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fetchReviewLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetchWithSessionCheck('/api/logs/reviews', {
                headers: {'Content-Type': 'application/json'},
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
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    return (
        <Paper sx={{p: {xs: 1, sm: 2, md: 3}, width: '100%', overflow: 'hidden'}}>
            <Typography variant="h6" component="h2" gutterBottom sx={{fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>
                Review Activity Logs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: {xs: 1, sm: 2, md: 3}}}>
                Monitor review creation, updates, and deletion activities
            </Typography>

            {logs.length === 0 ? (
                <Alert severity="info">No review logs found.</Alert>
            ) : (
                <Box sx={{maxHeight: {xs: '350px', sm: '450px'}, overflow: 'auto', WebkitOverflowScrolling: 'touch'}}>
                    <TableContainer sx={{overflow: 'auto'}}>
                        <Table sx={{minWidth: {xs: 300, sm: 650}}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{
                                        display: {xs: 'none', sm: 'table-cell'},
                                        position: 'sticky',
                                        top: 0,
                                        backgroundColor: 'background.paper',
                                        zIndex: 1
                                    }}><strong>Log ID</strong></TableCell>
                                    <TableCell sx={{
                                        position: 'sticky',
                                        top: 0,
                                        backgroundColor: 'background.paper',
                                        zIndex: 1
                                    }}><strong>Review ID</strong></TableCell>
                                    <TableCell sx={{
                                        position: 'sticky',
                                        top: 0,
                                        backgroundColor: 'background.paper',
                                        zIndex: 1
                                    }}><strong>Operation</strong></TableCell>
                                    <TableCell sx={{
                                        position: 'sticky',
                                        top: 0,
                                        backgroundColor: 'background.paper',
                                        zIndex: 1
                                    }}><strong>Date & Time</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.logID} hover>
                                        <TableCell
                                            sx={{display: {xs: 'none', sm: 'table-cell'}}}>{log.logID}</TableCell>
                                        <TableCell>{log.reviewID}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.operation}
                                                color={getOperationColor(log.operation)}
                                                size="small"
                                                sx={{fontSize: {xs: '0.7rem', sm: '0.75rem'}}}
                                            />
                                        </TableCell>
                                        <TableCell sx={{
                                            fontSize: {
                                                xs: '0.7rem',
                                                sm: 'inherit'
                                            }
                                        }}>{formatDate(log.date)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Paper>
    );
};

export default ReviewLogs;
