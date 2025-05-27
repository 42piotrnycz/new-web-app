export const isSessionExpired = (response) => {
    return response.status === 401 &&
        (response.headers.get('X-Session-Expired') === 'true' ||
            response.headers.get('x-session-expired') === 'true');
};

export const handleSessionExpired = (message = 'Your session has expired. Please log in again.') => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';

    alert(message);
    window.location.href = '/login';
};

export const fetchWithSessionCheck = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            credentials: 'include',
            ...options
        });

        if (isSessionExpired(response)) {
            try {
                const errorData = await response.json();
                handleSessionExpired(errorData.error || 'Your session has expired. Please log in again.');
            } catch {
                handleSessionExpired();
            }
            return response;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

export default {
    isSessionExpired,
    handleSessionExpired,
    fetchWithSessionCheck
};
