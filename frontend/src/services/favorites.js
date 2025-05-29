import {fetchWithSessionCheck} from '../utils/sessionUtils';

export const favoritesAPI = {
    toggleFavorite: async (reviewId) => {
        try {
            const response = await fetchWithSessionCheck(`/api/favorites/toggle/${reviewId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to toggle favorite');
            }

            return await response.json();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    },

    checkFavoriteStatus: async (reviewId) => {
        try {
            const response = await fetchWithSessionCheck(`/api/favorites/check/${reviewId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to check favorite status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking favorite status:', error);
            throw error;
        }
    },

    getUserFavorites: async () => {
        try {
            const response = await fetchWithSessionCheck('/api/favorites/my-favorites', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get user favorites');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user favorites:', error);
            throw error;
        }
    },

    getFavoriteCount: async (reviewId) => {
        try {
            const response = await fetchWithSessionCheck(`/api/favorites/count/${reviewId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get favorite count');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting favorite count:', error);
            throw error;
        }
    }
};

export default favoritesAPI;
