import { User } from '../models/User.js';

class AuthService {
    constructor() {
        this.ROOT_KEY = 'health-climate-portal-auth';
        this.currentUser = null;
        this.users = {};
        this.loadUsers();
    }

    loadUsers() {
        try {
            const storedData = localStorage.getItem(this.ROOT_KEY);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.users = data.users || {};
            } else {
                // Initialize with default users for prototype
                this.users = {
                    'admin@city.gov': {
                        id: 1,
                        email: 'admin@city.gov',
                        firstName: 'Admin',
                        lastName: 'User',
                        department: 'IT',
                        cityAssignment: 'Main City',
                        role: 'Admin',
                        password: 'admin', // In production, this should be hashed
                        status: 'Active'
                    },
                    'staff@city.gov': {
                        id: 2,
                        email: 'staff@city.gov',
                        firstName: 'Staff',
                        lastName: 'User',
                        department: 'Health',
                        cityAssignment: 'Main City',
                        role: 'Staff',
                        password: 'staff',
                        status: 'Active'
                    }
                };
                this.saveUsers();
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = {};
        }
    }

    saveUsers() {
        try {
            localStorage.setItem(this.ROOT_KEY, JSON.stringify({ users: this.users }));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    login(email, password) {
        const user = this.users[email];
        if (user && user.password === password && user.status === 'Active') {
            this.currentUser = new User(user);
            this.currentUser.metadata.lastLogin = new Date();
            return this.currentUser;
        }
        throw new Error('Invalid email or password');
    }

    logout() {
        this.currentUser = null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    addUser(userData) {
        if (this.users[userData.email]) {
            throw new Error('User already exists');
        }

        try {
            User.validate(userData);
            const newUser = {
                ...userData,
                id: Object.keys(this.users).length + 1,
                status: 'Active'
            };
            this.users[userData.email] = newUser;
            this.saveUsers();
            return new User(newUser);
        } catch (error) {
            throw new Error(`Failed to add user: ${error.message}`);
        }
    }

    updateUser(email, updates) {
        if (!this.users[email]) {
            throw new Error('User not found');
        }

        try {
            const updatedUser = {
                ...this.users[email],
                ...updates,
                email // Ensure email remains unchanged
            };
            User.validate(updatedUser);
            this.users[email] = updatedUser;
            this.saveUsers();
            return new User(updatedUser);
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    deactivateUser(email) {
        if (!this.users[email]) {
            throw new Error('User not found');
        }
        this.users[email].status = 'Inactive';
        this.saveUsers();
    }
}

export const authService = new AuthService();