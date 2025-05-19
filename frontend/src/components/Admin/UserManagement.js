import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/users/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            setUsers([]); // Clear users on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setDialogOpen(true);
    };    const handleUpdateRole = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ role: selectedRole })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update role');
            }

            const updatedUser = await response.json();
            
            // Update the users list with the returned updated user data
            const updatedUsers = users.map(user =>
                user.id === selectedUser.id ? { ...user, role: updatedUser.role } : user
            );
            setUsers(updatedUsers);
            setError(null); // Clear any previous errors
            setDialogOpen(false);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(err.message);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }    return (
        <>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleRoleChange(user)}
                                    >
                                        Change Role
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Change User Role</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={selectedRole}
                            label="Role"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <MenuItem value="ROLE_USER">User</MenuItem>
                            <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateRole} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserManagement;
