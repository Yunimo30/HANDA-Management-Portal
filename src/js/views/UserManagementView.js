export default class UserManagementView {
    constructor({ container, authService, showMessage }) {
        this.container = container;
        this.authService = authService;
        this.showMessage = showMessage;
    }

    handleAddUser(e) {
        e.preventDefault();
        const form = e.target;
        
        if (form.password.value !== form.confirmPassword.value) {
            this.showMessage('Error', 'Passwords do not match');
            return;
        }

        const userData = {
            email: form.email.value,
            password: form.password.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            department: form.department.value,
            cityAssignment: form.cityAssignment.value,
            role: form.role.value
        };

        try {
            this.authService.addUser(userData);
            this.showMessage('Success', 'User added successfully');
            form.reset();
            this.render();
        } catch (error) {
            this.showMessage('Error', error.message);
        }
    }

    handleDeactivate(email) {
        if (confirm('Are you sure you want to deactivate this user?')) {
            try {
                this.authService.deactivateUser(email);
                this.showMessage('Success', 'User deactivated successfully');
                this.render();
            } catch (error) {
                this.showMessage('Error', error.message);
            }
        }
    }

    render() {
        const currentUser = this.authService.getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'Admin') {
            this.container.innerHTML = `
                <div class="max-w-7xl mx-auto">
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-red-600 font-medium">Access Denied</p>
                        <p class="text-red-500">Only administrators can access user management.</p>
                    </div>
                </div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <!-- Add User Form -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6">Add New User</h3>
                    <form id="add-user-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="firstName" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="lastName" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Department</label>
                                <input type="text" name="department" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">City Assignment</label>
                                <input type="text" name="cityAssignment" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role" required class="input-field">
                                    <option value="Staff">Staff</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" required class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input type="password" name="confirmPassword" required class="input-field">
                            </div>
                        </div>
                        <div>
                            <button type="submit" class="btn-primary">Add User</button>
                        </div>
                    </form>
                </div>

                <!-- Users List -->
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6">User Management</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.renderUsersList()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('add-user-form').addEventListener('submit', this.handleAddUser.bind(this));
        
        // Set up deactivate button listeners
        document.querySelectorAll('.deactivate-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const email = e.target.dataset.email;
                this.handleDeactivate(email);
            });
        });
    }

    renderUsersList() {
        const users = Object.entries(this.authService.users)
            .filter(([email]) => email !== this.authService.getCurrentUser().email)
            .map(([email, user]) => ({email, ...user}));

        if (users.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No users found
                    </td>
                </tr>
            `;
        }

        return users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${user.firstName} ${user.lastName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${user.department}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${user.status === 'Active' ? `
                        <button 
                            data-email="${user.email}"
                            class="deactivate-user-btn text-red-600 hover:text-red-900"
                        >
                            Deactivate
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }
}