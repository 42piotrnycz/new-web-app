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
import { fetchWithSessionCheck } from '../../utils/sessionUtils';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(null);
    const [selectedRole, setSelectedRole] = useState(''); const fetchUsers = async () => {
        try {
            const response = await fetchWithSessionCheck('/api/users/all', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            let data;
            try {
                const textData = await response.text();
                data = textData ? JSON.parse(textData) : null;
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response format from server');
            }

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to fetch users');
            }

            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format received from server');
            }

            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); const handleRoleChange = async (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setDialogOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    }; const handleDeleteConfirm = async () => {
        try {
            const response = await fetchWithSessionCheck(`/api/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete user');
            }

            setUsers(users.filter(user => user.id !== selectedUser.id));
            setError(null);
            setDeleteDialogOpen(false);

            setDeleteSuccess({
                message: result.message,
                reviewsDeleted: result.reviewsDeleted
            });

            setTimeout(() => {
                setDeleteSuccess(null);
            }, 5000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.message);
        }
    }; const handleUpdateRole = async () => {
        try {
            const response = await fetchWithSessionCheck(`/api/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: {
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

            const updatedUsers = users.map(user =>
                user.id === selectedUser.id ? { ...user, role: updatedUser.role } : user
            );
            setUsers(updatedUsers);
            setError(null); 
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
    } return (
        <>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {deleteSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {deleteSuccess.message} ({deleteSuccess.reviewsDeleted} reviews deleted)
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
                                <TableCell>{user.role}</TableCell>                                <TableCell>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleRoleChange(user)}
                                        sx={{ mr: 1 }}
                                    >
                                        Change Role
                                    </Button>
                                    {user.role !== 'ROLE_ADMIN' && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            Delete
                                        </Button>
                                    )}
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
                </DialogActions>            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete User</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserManagement;
