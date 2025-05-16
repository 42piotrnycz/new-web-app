import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
    Paper,
    CircularProgress
} from '@mui/material';

const AddReview = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        contentType: '',
        contentTitle: '',
        reviewTitle: '',
        reviewDescription: '',
        cover: null
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                cover: file
            }));
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] != null) {
                data.append(key, formData[key]);
            }
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create review');
            }

            setSuccess(true);
            // Clear form
            setFormData({
                contentType: '',
                contentTitle: '',
                reviewTitle: '',
                reviewDescription: '',
                cover: null
            });
            setPreviewUrl(null);
            
            // Redirect after a short delay
            setTimeout(() => {
                navigate('/reviews');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const contentTypes = [
        { value: 'game', label: 'Game' },
        { value: 'movie', label: 'Movie' },
        { value: 'tvseries', label: 'TV Series' },
        { value: 'book', label: 'Book' }
    ];

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Add New Review
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Review added successfully! Redirecting to reviews page...
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        select
                        fullWidth
                        required
                        margin="normal"
                        name="contentType"
                        label="Content Type"
                        value={formData.contentType}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        {contentTypes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        name="contentTitle"
                        label="Content Title"
                        value={formData.contentTitle}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        name="reviewTitle"
                        label="Review Title"
                        value={formData.reviewTitle}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        name="reviewDescription"
                        label="Review Description"
                        value={formData.reviewDescription}
                        onChange={handleChange}
                        multiline
                        rows={5}
                        disabled={loading}
                    />

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <input
                            accept="image/*"
                            id="cover-file"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <label htmlFor="cover-file">
                            <Button
                                variant="outlined"
                                component="span"
                                disabled={loading}
                                fullWidth
                            >
                                Upload Cover Image
                            </Button>
                        </label>
                        {previewUrl && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img
                                    src={previewUrl}
                                    alt="Cover preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddReview;
