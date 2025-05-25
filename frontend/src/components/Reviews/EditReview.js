import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditReview = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        contentType: '',
        contentTitle: '',
        reviewTitle: '',
        reviewDescription: '',
        coverFile: null
    });
    const [currentCover, setCurrentCover] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null); useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await fetch(`/api/reviews/${reviewId}`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch review');
                }

                const reviewData = await response.json();
                setFormData({
                    contentType: reviewData.contentType,
                    contentTitle: reviewData.contentTitle,
                    reviewTitle: reviewData.reviewTitle || '',
                    reviewDescription: reviewData.reviewDescription,
                    coverFile: null
                });
                setCurrentCover(reviewData.coverFile);
                if (reviewData.coverFile) {
                    setPreviewUrl(`/uploads/${reviewData.coverFile}`);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [reviewId]);

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
                coverFile: file
            }));
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

        // Add flag to indicate whether to keep existing cover
        data.append('keepExistingCover', !formData.coverFile && currentCover ? 'true' : 'false'); try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                credentials: 'include',
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update review');
            }

            setSuccess(true);
            // Redirect after a short delay
            setTimeout(() => {
                navigate(`/review/${reviewId}`);
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

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Edit Review
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Review updated successfully! Redirecting...
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
                                {currentCover ? 'Change Cover Image' : 'Upload Cover Image'}
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
                        {loading ? <CircularProgress size={24} /> : 'Update Review'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditReview;
