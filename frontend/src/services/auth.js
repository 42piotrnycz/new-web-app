const login = async (username, password) => {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to login');
        }        const data = await response.json();
        localStorage.setItem('token', data.token);
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

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
};

const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            return null;
        }

        return response.json();
    } catch (error) {
        console.error('Get current user error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        return null;
    }
};

export const authService = {
    login,
    register,
    logout,
    getCurrentUser
};
