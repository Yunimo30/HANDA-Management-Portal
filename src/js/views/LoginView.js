export default class LoginView {
    constructor({ container, authService, showMessage }) {
        this.container = container;
        this.authService = authService;
        this.showMessage = showMessage;
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            this.authService.login(email, password);
            this.showMessage('Success', 'Welcome back!');
            window.dispatchEvent(new CustomEvent('viewChange', { detail: 'Dashboard' }));
        } catch (error) {
            this.showMessage('Login Failed', error.message);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center justify-center min-h-[60vh]">
                    <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h3 class="text-3xl font-bold text-center mb-6 text-gray-800">Staff / Admin Login</h3>
                        <form id="login-form" class="space-y-6">
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    required 
                                    placeholder="e.g., staff@city.gov" 
                                    class="input-field"
                                >
                            </div>
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    required 
                                    placeholder="Enter your password" 
                                    class="input-field"
                                >
                            </div>
                            <button type="submit" class="btn-primary w-full py-3 text-lg">
                                Log In
                            </button>
                        </form>
                        <p class="mt-6 text-center text-sm text-gray-500">
                            **Prototype Credentials:**<br>
                            Admin: <code>admin@city.gov</code> / <code>admin</code><br>
                            Staff: <code>staff@city.gov</code> / <code>staff</code>
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Add form submit handler
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
    }
}