import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const fetchUsers = async () => {
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
    }, []);
    const handleRoleChange = async (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setDialogOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
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
    };
    const handleUpdateRole = async () => {
        try {
            const response = await fetchWithSessionCheck(`/api/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({role: selectedRole})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update role');
            }

            const updatedUser = await response.json();

            const updatedUsers = users.map(user =>
                user.id === selectedUser.id ? {...user, role: updatedUser.role} : user
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
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                sx={{
                    fontSize: {xs: '0.8rem', sm: '0.875rem'},
                    py: {xs: 0.5, sm: 1}
                }}
            >
                {error}
            </Alert>
        );
    }
    return (
        <>
            <Typography variant="h6" component="h2" gutterBottom sx={{
                fontSize: {xs: '1.1rem', sm: '1.25rem'},
                display: {sm: 'none'}
            }}>
                User Management
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: {xs: 1, sm: 2},
                        fontSize: {xs: '0.8rem', sm: '0.875rem'},
                        py: {xs: 0.5, sm: 1}
                    }}
                >
                    {error}
                </Alert>
            )}

            {deleteSuccess && (
                <Alert
                    severity="success"
                    sx={{
                        mb: {xs: 1, sm: 2},
                        fontSize: {xs: '0.8rem', sm: '0.875rem'},
                        py: {xs: 0.5, sm: 1}
                    }}
                >
                    {deleteSuccess.message} ({deleteSuccess.reviewsDeleted} reviews deleted)
                </Alert>
            )}<TableContainer component={Paper} sx={{overflow: 'auto'}}>
            <Table sx={{minWidth: {xs: 300, sm: 650}}}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>ID</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell sx={{display: {xs: 'none', md: 'table-cell'}}}>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell sx={{display: {xs: 'none', md: 'table-cell'}}}>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: {xs: 'column', sm: 'row'},
                                    gap: {xs: 1, sm: 1}
                                }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleRoleChange(user)}
                                        sx={{minWidth: {xs: '100%', sm: 'auto'}}}
                                    >
                                        Change Role
                                    </Button>
                                    {user.role !== 'ROLE_ADMIN' && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                            sx={{minWidth: {xs: '100%', sm: 'auto'}}}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer> <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            fullScreen={window.innerWidth < 600}
            PaperProps={{
                sx: {width: {xs: '100%', sm: '400px'}, m: {xs: 0, sm: 2}}
            }}
        >
            <DialogTitle sx={{fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>Change User Role</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{mt: {xs: 1, sm: 2}}}>
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
            <DialogActions sx={{p: {xs: 2}}}>
                <Button onClick={() => setDialogOpen(false)} size="small">Cancel</Button>
                <Button onClick={handleUpdateRole} color="primary" size="small">
                    Update
                </Button>
            </DialogActions>
        </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                fullScreen={window.innerWidth < 600}
                PaperProps={{
                    sx: {width: {xs: '100%', sm: '400px'}, m: {xs: 0, sm: 2}}
                }}
            >
                <DialogTitle sx={{fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>Confirm Delete User</DialogTitle>
                <DialogContent sx={{py: {xs: 2}}}>
                    Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
                </DialogContent>
                <DialogActions sx={{p: {xs: 2}}}>
                    <Button onClick={() => setDeleteDialogOpen(false)} size="small">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" size="small">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserManagement;
