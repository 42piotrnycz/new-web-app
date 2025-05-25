import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const debouncedSearch = useCallback(
        debounce((term) => {
            if (term.trim()) {
                handleSearch(term);
            } else {
                setUsers([]);
            }
        }, 300),
        []
    );    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    } const handleSearch = async (term = searchTerm) => {
        if (!term.trim()) {
            setUsers([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/search?username=${encodeURIComponent(term)}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError('Failed to search users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => debouncedSearch.cancel;
    }, [searchTerm, debouncedSearch]);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setUsers([]);
    };

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}/reviews`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Search Users
            </Typography>

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton onClick={handleSearch} disabled={loading}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClear} disabled={loading}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    disabled={loading}
                />
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                    {error}
                </Typography>
            )}

            {!loading && !error && users.length > 0 && (
                <Paper>
                    <List>
                        {users.map((user) => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton onClick={() => handleUserClick(user.id)}>
                                    <ListItemText primary={user.username} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {!loading && !error && users.length === 0 && searchTerm && (
                <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                    No users found matching "{searchTerm}"
                </Typography>
            )}
        </Container>
    );
};

export default UserSearch;
