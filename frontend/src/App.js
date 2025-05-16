import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Home from './components/Home/Home';
import ReviewList from './components/Reviews/ReviewList';
import ReviewDetail from './components/Reviews/ReviewDetail';
import AddReview from './components/Reviews/AddReview';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
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
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              REviewer 2.0
            </Typography>
            {user ? (
              <>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/reviews">
                  My Reviews
                </Button>
                <Button color="inherit" component={Link} to="/add-review">
                  Add Review
                </Button>
                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
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
            />
            <Route
              path="/review/:reviewId"
              element={user ? <ReviewDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/user/:userId/reviews"
              element={user ? <ReviewList /> : <Navigate to="/login" />}
            />
            <Route
              path="/add-review"
              element={user ? <AddReview /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
