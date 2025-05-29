import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';

/**
 * Component for adding or editing reviews
 */
const ReviewForm = ({
    initialValues = {
        contentType: '',
        contentTitle: '',
        reviewTitle: '',
        reviewDescription: '',
        cover: null
    },
    currentCover = null,
    onSubmit,
    onCancel,
    submitButtonText = 'Submit',
    isEdit = false,
    isLoading = false,
    error = null
}) => {
    const [formData, setFormData] = useState(initialValues);
    const [previewUrl, setPreviewUrl] = useState(
        currentCover ? `/uploads/${currentCover}` : null
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();

                img.onload = () => {
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

                    if (!needsResize) {
                        resolve(file);
                        return;
                    }

                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;


                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

    
                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        resolve(resizedFile);
                    }, file.type, quality);
                };

                img.src = readerEvent.target.result;
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                const resizedFile = await resizeImage(file);

                setFormData(prev => ({
                    ...prev,
                    cover: resizedFile
                }));

            } catch (err) {
                console.error('Error resizing image:', err);

                setFormData(prev => ({
                    ...prev,
                    cover: file
                }));
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (formData.cover && formData.cover.size > 5 * 1024 * 1024) {
            return { error: "Image is still too large. Maximum allowed size is 5MB." };
        }

        onSubmit(formData);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEdit ? 'Edit Review' : 'Add New Review'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleFormSubmit}>
                    <TextField
                        select
                        fullWidth
                        required
                        label="Content Type"
                        name="contentType"
                        value={formData.contentType}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                    >
                        <MenuItem value="movie">Movie</MenuItem>
                        <MenuItem value="tvseries">TV Series</MenuItem>
                        <MenuItem value="book">Book</MenuItem>
                        <MenuItem value="game">Game</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        required
                        label="Content Title"
                        name="contentTitle"
                        value={formData.contentTitle}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        label="Review Title (Optional)"
                        name="reviewTitle"
                        value={formData.reviewTitle}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        required
                        label="Review Description"
                        name="reviewDescription"
                        value={formData.reviewDescription}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        multiline
                        rows={5}
                    />

                    <Box sx={{ mt: 3, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Cover Image {isEdit ? '(Optional)' : '(Required)'}
                        </Typography>

                        <input
                            accept="image/*"
                            type="file"
                            id="cover-upload"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <label htmlFor="cover-upload">
                            <Button
                                variant="contained"
                                component="span"
                            >
                                Upload Image
                            </Button>
                        </label>

                        {previewUrl && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={previewUrl}
                                    alt="Cover Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                submitButtonText
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ReviewForm;
