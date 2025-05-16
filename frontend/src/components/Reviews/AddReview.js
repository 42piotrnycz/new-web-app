import React, { useState } from 'react';

const AddReview = () => {
    const [formData, setFormData] = useState({
        contentType: '',
        contentTitle: '',
        reviewTitle: '',
        reviewDescription: '',
        cover: null
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            cover: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] != null) {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create review');
            }

            setSuccess(true);
            setFormData({
                contentType: '',
                contentTitle: '',
                reviewTitle: '',
                reviewDescription: '',
                cover: null
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="add-review">
            <h2>Add New Review</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">Review added successfully!</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Content Type:*
                        <select
                            name="contentType"
                            value={formData.contentType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="game">Game</option>
                            <option value="movie">Movie</option>
                            <option value="tvseries">TV Series</option>
                            <option value="book">Book</option>
                        </select>
                    </label>
                </div>

                <div>
                    <label>
                        Content Title:*
                        <input
                            type="text"
                            name="contentTitle"
                            value={formData.contentTitle}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Review Title:
                        <input
                            type="text"
                            name="reviewTitle"
                            value={formData.reviewTitle}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Review Description:*
                        <textarea
                            name="reviewDescription"
                            value={formData.reviewDescription}
                            onChange={handleChange}
                            required
                            rows="5"
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Cover Image:
                        <input
                            type="file"
                            name="cover"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </label>
                </div>

                <button type="submit">Submit Review</button>
            </form>
        </div>
    );
};

export default AddReview;
