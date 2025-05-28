import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Box, Button, CircularProgress, Container, MenuItem, Paper, TextField, Typography} from '@mui/material';
import {fetchWithSessionCheck} from '../../utils/sessionUtils';

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
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) => {
        return new Promise((resolve) => {
            // Create a FileReader to read the file
            const reader = new FileReader();

            // Set up the FileReader onload event
            reader.onload = (readerEvent) => {
                // Create an image element
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    let needsResize = false;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                        needsResize = true;
                    }

                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                        needsResize = true;
                    }

                    // If the image is smaller than our max dimensions, don't resize
                    if (!needsResize) {
                        resolve(file);
                        return;
                    }

                    // Create a canvas element
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    // Draw the image on the canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas to blob
                    canvas.toBlob((blob) => {
                        // Create a new File object from the blob
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        resolve(resizedFile);
                    }, file.type, quality);
                };

                // Set the image source to the FileReader result
                img.src = readerEvent.target.result;
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Create preview URL first
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);

                // Resize the image if it's too large
                const resizedFile = await resizeImage(file);

                setFormData(prev => ({
                    ...prev,
                    cover: resizedFile
                }));

                // Log the file sizes for reference
                console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                console.log(`Resized file size: ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`);

            } catch (err) {
                console.error('Error resizing image:', err);
                setError('Error processing image. Please try a different file.');

                // If error occurs, still set the original file
                setFormData(prev => ({
                    ...prev,
                    cover: file
                }));
            }
        }
        setError(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        // Check if image size is still too large
        if (formData.cover && formData.cover.size > 5 * 1024 * 1024) { // 5MB limit
            setError("Image is still too large. Maximum allowed size is 5MB.");
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] != null) {
                data.append(key, formData[key]);
            }
        });
        try {
            const response = await fetchWithSessionCheck('/api/reviews', {
                method: 'POST',
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
        {value: 'game', label: 'Game'},
        {value: 'movie', label: 'Movie'},
        {value: 'tvseries', label: 'TV Series'},
        {value: 'book', label: 'Book'}
    ];

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{p: 4, mt: 4}}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Add New Review
                </Typography>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{mb: 2}}>
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

                    <Box sx={{mt: 2, mb: 2}}>
                        <input
                            accept="image/*"
                            id="cover-file"
                            type="file"
                            style={{display: 'none'}}
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
                            <Box sx={{mt: 2, textAlign: 'center'}}>
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
                        sx={{mt: 2}}
                    >
                        {loading ? <CircularProgress size={24}/> : 'Submit Review'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddReview;
