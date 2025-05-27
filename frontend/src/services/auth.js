import { fetchWithSessionCheck, isSessionExpired, handleSessionExpired } from '../utils/sessionUtils';

const login = async (username, password) => {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to login');
        }

        const data = await response.json();
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

const register = async (username, password, email) => {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password, email })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to register');
        }

        return response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

const logout = async () => {
    try {
        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    }
};

const getCurrentUser = async () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (!userId || !username || !role) {
        return null;
    }

    try {
        const response = await fetchWithSessionCheck('/api/users/me', {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (!isSessionExpired(response)) {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
            }
            return null;
        }

        const textData = await response.text();
        if (!textData) {
            throw new Error('Empty response');
        }

        const data = JSON.parse(textData);
        return data;
    } catch (error) {
        console.error('Get current user error:', error);
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        return null;
    }
};

export const authService = {
    login,
    register,
    logout,
    getCurrentUser
};

export { fetchWithSessionCheck, isSessionExpired, handleSessionExpired } from '../utils/sessionUtils';
