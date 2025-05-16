import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import ReviewList from './components/Reviews/ReviewList';
import AddReview from './components/Reviews/AddReview';
import './App.css';

function App() {
  // TODO: Get actual user ID from authentication
  const userId = 1; 

  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              ZTPAI Reviews
            </Typography>
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
            <Button color="inherit">
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container style={{ marginTop: '2rem' }}>
          <Routes>
            <Route path="/" element={<div>Welcome to ZTPAI Reviews</div>} />
            <Route path="/reviews" element={<ReviewList userId={userId} />} />
            <Route path="/add-review" element={<AddReview />} />
            <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
