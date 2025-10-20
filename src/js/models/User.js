export class User {
    constructor({
        id,
        email,
        firstName,
        lastName,
        department,
        cityAssignment,
        role,
        status = 'Active'
    }) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.cityAssignment = cityAssignment;
        this.role = role;
        this.status = status;
        this.metadata = {
            createdAt: new Date(),
            lastLogin: null
        };
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    static validate(data) {
        const requiredFields = ['email', 'firstName', 'lastName', 'department', 'cityAssignment', 'role'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Role validation
        if (!['Admin', 'Staff', 'Public'].includes(data.role)) {
            throw new Error('Invalid user role');
        }

        return true;
    }
}