import { BrowserRouter as Router, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Home from './components/Home/Home';
import AdminPanel from './components/Admin/AdminPanel';
import ReviewList from './components/Reviews/ReviewList';
import ReviewDetail from './components/Reviews/ReviewDetail';
import ContentReviewList from './components/Reviews/ContentReviewList';
import AddReview from './components/Reviews/AddReview';
import EditReview from './components/Reviews/EditReview';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import UserSearch from './components/Users/UserSearch';
import NavButton from './components/UI/NavButton';
import NavContainer from './components/UI/NavContainer';
import { authService } from './services/auth';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    setUser(userData);
                    setIsAdmin(userData.role === 'ROLE_ADMIN');
                    localStorage.setItem('role', userData.role);
                } else {
                    setUser(null);
                    setIsAdmin(false);
                    localStorage.removeItem('role');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
                setIsAdmin(false);
                localStorage.removeItem('role');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <Router>            <div className="App" style={{ width: '100%', overflow: 'hidden' }}>            <AppBar
            position="static"
            sx={{
                width: '100%',
                boxShadow: 2,
                '& .MuiToolbar-root': {
                    paddingLeft: { xs: 1, sm: 2 },
                    paddingRight: { xs: 1, sm: 2 }
                }
            }}
        >
            <Toolbar sx={{
                width: '100%',
                padding: { xs: '0 8px', sm: '0 16px', md: '0 24px' },
                minHeight: { xs: 56, sm: 64 },
                justifyContent: 'space-between',
                pr: { xs: '16px', sm: '24px' },
                gap: { xs: 1, sm: 2 }
            }}>                    <Typography
                variant="h6"
                sx={{
                    flexGrow: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                    REviewer 2.0
                </Typography>

                {user ? (
                    isMobile ? (
                        <>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenuOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {isAdmin && (
                                    <MenuItem
                                        component={Link}
                                        to="/admin"
                                        onClick={handleMenuClose}
                                        sx={{
                                            color: 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Admin Panel
                                    </MenuItem>
                                )}
                                <MenuItem component={Link} to="/" onClick={handleMenuClose}>Home</MenuItem>
                                <MenuItem component={Link} to="/reviews" onClick={handleMenuClose}>My
                                    Reviews</MenuItem>
                                <MenuItem component={Link} to="/add-review" onClick={handleMenuClose}>Add
                                    Review</MenuItem>
                                <MenuItem component={Link} to="/search" onClick={handleMenuClose}>Search
                                    Users</MenuItem>
                                <MenuItem component={Link} to="/profile"
                                    onClick={handleMenuClose}>Profile</MenuItem>
                                <MenuItem onClick={() => {
                                    handleMenuClose();
                                    handleLogout();
                                }}>Logout</MenuItem>
                            </Menu>                            </>) : (<NavContainer>
                                {isAdmin && (
                                    <NavButton to="/admin" isAdmin>
                                        Admin Panel
                                    </NavButton>
                                )}
                                <NavButton to="/">
                                    Home
                                </NavButton>
                                <NavButton to="/reviews">
                                    My Reviews
                                </NavButton>
                                <NavButton to="/add-review">
                                    Add Review
                                </NavButton>
                                <NavButton to="/search">
                                    Search Users
                                </NavButton>
                                <NavButton to="/profile">
                                    Profile
                                </NavButton>
                                <NavButton onClick={handleLogout}>
                                    Logout
                                </NavButton>
                            </NavContainer>
                    )
                ) : (
                    isMobile ? (
                        <>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenuOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
                                <MenuItem component={Link} to="/register"
                                    onClick={handleMenuClose}>Register</MenuItem>
                            </Menu>
                        </>) : (<NavContainer>
                            <NavButton to="/login">
                                Login
                            </NavButton>
                            <NavButton to="/register">
                                Register
                            </NavButton>
                        </NavContainer>
                    )
                )}
            </Toolbar>
        </AppBar>

            <Container style={{ marginTop: '2rem' }}>
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={user ? <Home /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/reviews"
                        element={user ? <ReviewList userId={user.id} /> : <Navigate to="/login" />}
                    /> <Route
                        path="/review/:reviewId"
                        element={user ? <ReviewDetail /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/review/edit/:reviewId"
                        element={user ? <EditReview /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/admin/*"
                        element={
                            user && isAdmin ? (
                                <AdminPanel />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    /> <Route
                        path="/user/:userId/reviews"
                        element={user ? <ReviewList /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/content/:contentTitle"
                        element={user ? <ContentReviewList /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/add-review"
                        element={user ? <AddReview /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/profile"
                        element={user ? <Profile /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/search"
                        element={user ? <UserSearch /> : <Navigate to="/login" />}
                    />
                </Routes>
            </Container>
        </div>
        </Router>
    );
}

export default App;
