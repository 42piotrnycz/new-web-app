import {BrowserRouter as Router, Link, Navigate, Route, Routes} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {
    AppBar,
    Box,
    Button,
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
import {authService} from './services/auth';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    // Update role in localStorage in case it changed
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
        <Router>
            <div className="App" style={{width: '100%', overflow: 'hidden'}}><AppBar position="static"
                                                                                     sx={{width: '100%'}}>
                <Toolbar sx={{width: '100%', padding: {xs: '0 8px', sm: '0 16px'}}}>
                    <Typography variant="h6" style={{flexGrow: 1}}>
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
                                    <MenuIcon/>
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
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{display: 'flex'}}>
                                {isAdmin && (
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/admin"
                                        sx={{
                                            backgroundColor: 'error.main',
                                            '&:hover': {
                                                backgroundColor: 'error.dark',
                                            },
                                            mr: 2
                                        }}
                                    >
                                        Admin Panel
                                    </Button>
                                )}
                                <Button color="inherit" component={Link} to="/">
                                    Home
                                </Button>
                                <Button color="inherit" component={Link} to="/reviews">
                                    My Reviews
                                </Button>
                                <Button color="inherit" component={Link} to="/add-review">
                                    Add Review
                                </Button>
                                <Button color="inherit" component={Link} to="/search">
                                    Search Users
                                </Button>
                                <Button color="inherit" component={Link} to="/profile">
                                    Profile
                                </Button>
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Box>
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
                                    <MenuIcon/>
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
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">
                                    Login
                                </Button>
                                <Button color="inherit" component={Link} to="/register">
                                    Register
                                </Button>
                            </>
                        )
                    )}
                </Toolbar>
            </AppBar>

                <Container style={{marginTop: '2rem'}}>
                    <Routes>
                        <Route path="/login" element={user ? <Navigate to="/"/> : <Login/>}/>
                        <Route path="/register" element={user ? <Navigate to="/"/> : <Register/>}/>

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={user ? <Home/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/reviews"
                            element={user ? <ReviewList userId={user.id}/> : <Navigate to="/login"/>}
                        /> <Route
                        path="/review/:reviewId"
                        element={user ? <ReviewDetail/> : <Navigate to="/login"/>}
                    />
                        <Route
                            path="/review/edit/:reviewId"
                            element={user ? <EditReview/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/admin/*"
                            element={
                                user && isAdmin ? (
                                    <AdminPanel/>
                                ) : (
                                    <Navigate to="/" replace/>
                                )
                            }
                        /> <Route
                        path="/user/:userId/reviews"
                        element={user ? <ReviewList/> : <Navigate to="/login"/>}
                    />
                        <Route
                            path="/content/:contentTitle"
                            element={user ? <ContentReviewList/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/add-review"
                            element={user ? <AddReview/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/profile"
                            element={user ? <Profile/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/search"
                            element={user ? <UserSearch/> : <Navigate to="/login"/>}
                        />
                    </Routes>
                </Container>
            </div>
        </Router>
    );
}

export default App;
