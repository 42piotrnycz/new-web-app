import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWithSessionCheck } from '../../utils/sessionUtils';
import ReviewForm from '../UI/ReviewForm';

const EditReview = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({
        contentType: '',
        contentTitle: '',
        reviewTitle: '',
        reviewDescription: '',
        cover: null
    });
    const [currentCover, setCurrentCover] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await fetchWithSessionCheck(`/api/reviews/${reviewId}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch review');
                }

                const reviewData = await response.json();
                setInitialValues({
                    contentType: reviewData.contentType,
                    contentTitle: reviewData.contentTitle,
                    reviewTitle: reviewData.reviewTitle || '',
                    reviewDescription: reviewData.reviewDescription,
                    cover: null
                });
                setCurrentCover(reviewData.coverFile);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [reviewId]);

    const handleSubmit = async (formData) => {
        setError(null);
        setSubmitting(true);

        const data = new FormData();

        // Only include cover in formData if it has changed
        Object.keys(formData).forEach(key => {
            if (formData[key] != null && !(key === 'cover' && !formData[key])) {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await fetchWithSessionCheck(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update review');
            }
            setTimeout(() => {
                navigate(`/review/${reviewId}`);
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(`/review/${reviewId}`);
    };

    if (loading) {
        return <ReviewForm isLoading={true} />;
    }

    return (
        <ReviewForm
            initialValues={initialValues}
            currentCover={currentCover}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Update Review"
            isEdit={true}
            isLoading={submitting}
            error={error}
        />
    );
};

export default EditReview;
