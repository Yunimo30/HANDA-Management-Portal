export class Navigation {
    constructor(container, authService) {
        this.container = container;
        this.authService = authService;
        this.currentView = 'Home';
    }

    getNavItems() {
        const role = this.authService.getCurrentUser()?.role || 'Public';
        
        return [
            {
                name: 'Home',
                roles: ['Public', 'Staff', 'Admin'],
                icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            },
            {
                name: 'Dashboard',
                roles: ['Public', 'Staff', 'Admin'],
                icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0v8a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            },
            {
                name: 'Records',
                roles: ['Staff', 'Admin'],
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            },
            {
                name: 'Reports',
                roles: ['Staff', 'Admin'],
                icon: 'M9 17v-4m0 0h6m-6 0l-2 2'
            },
            {
                name: 'UserManagement',
                roles: ['Admin'],
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
            },
            {
                name: 'Login',
                roles: ['Public'],
                icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1'
            },
            {
                name: 'Logout',
                roles: ['Staff', 'Admin'],
                icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1'
            }
        ].filter(item => item.roles.includes(role));
    }

    setCurrentView(viewName) {
        this.currentView = viewName;
        this.render();
    }

    render() {
        const navItems = this.getNavItems();
        const user = this.authService.getCurrentUser();

        // Render navigation items
        this.container.innerHTML = navItems.map(item => `
            <button 
                data-view="${item.name}"
                class="nav-item ${this.currentView === item.name ? 'nav-item-active' : 'nav-item-inactive'}"
            >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path>
                </svg>
                <span>${item.name === 'UserManagement' ? 'User Management' : item.name}</span>
            </button>
        `).join('');

        // Render auth status
        const authStatus = document.getElementById('auth-status');
        if (user) {
            authStatus.innerHTML = `
                <p class="font-bold text-white">${user.fullName}</p>
                <p class="text-sm text-indigo-300">Role: ${user.role}</p>
                <p class="text-xs text-gray-400">${user.department}</p>
            `;
        } else {
            authStatus.innerHTML = `
                <p class="font-bold text-yellow-400">Public View</p>
                <p class="text-xs text-gray-400">Please log in for full access.</p>
            `;
        }

        // Add event listeners
        this.container.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const viewName = button.dataset.view;
                if (viewName === 'Logout') {
                    if (confirm('Are you sure you want to log out?')) {
                        this.authService.logout();
                        window.dispatchEvent(new CustomEvent('viewChange', { detail: 'Home' }));
                    }
                } else {
                    window.dispatchEvent(new CustomEvent('viewChange', { detail: viewName }));
                }
            });
        });
    }
}