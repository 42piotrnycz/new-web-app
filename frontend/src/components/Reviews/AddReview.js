import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithSessionCheck } from '../../utils/sessionUtils';
import ReviewForm from '../UI/ReviewForm';

const AddReview = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setError(null);
        setLoading(true);

        if (!formData.contentType || !formData.contentTitle || !formData.reviewDescription || !formData.cover) {
            setError('Please fill all required fields and upload a cover image');
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
                throw new Error(errorData.message || 'Failed to add review');
            }

            setTimeout(() => {
                navigate('/reviews');
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/reviews');
    };

    return (
        <ReviewForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Add Review"
            isLoading={loading}
            error={error}
        />
    );
};

export default AddReview;
