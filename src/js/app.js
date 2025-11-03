import '../css/main.css';
import '../css/transitions.css';
import { authService } from './services/AuthService.js';
import { dataService } from './services/DataService.js';
import { Navigation } from './views/Navigation.js';
import { addViewTransitions, animateViewChange, setupMobileMenuTransitions } from './views/ViewTransitions.js';

class App {
    constructor() {
        this.navigation = new Navigation(
            document.getElementById('nav-container'),
            authService
        );
        
        this.setupEventListeners();
        this.currentView = 'Home';
    }

    setupEventListeners() {
        // Listen for view changes
        window.addEventListener('viewChange', (event) => {
            this.renderView(event.detail);
        });

        // Setup modal close button
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            document.getElementById('message-modal').classList.add('hidden');
        });
    }

    showMessage(title, body) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').textContent = body;
        document.getElementById('message-modal').classList.remove('hidden');
    }

    async renderView(viewName) {
        this.currentView = viewName;
        this.navigation.setCurrentView(viewName);

        const mainContent = document.getElementById('main-content');
        
        // Fade out current content
        mainContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';

        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            // Show loading state
            mainContent.innerHTML = `
                <div class="flex items-center justify-center min-h-[200px]">
                    <div class="relative">
                        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <div class="mt-4 text-gray-600 animate-pulse">Loading...</div>
                    </div>
                </div>
            `;

            // Reset opacity for loading indicator
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';

            // Load the new view
            const module = await import(`./views/${viewName}View.js`);
            const ViewClass = module.default;
            
            const view = new ViewClass({
                container: mainContent,
                authService,
                dataService,
                showMessage: this.showMessage.bind(this)
            });

            // Store the view instance
            this.currentViewInstance = view;
            
            // Fade out loading indicator
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateY(20px)';
            
            // Wait for fade out
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Render the new view
            view.render();
            
            // Force a reflow
            mainContent.offsetHeight;
            
            // Fade in the new view
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
            
            // Add transitions to new elements
            addViewTransitions();

            // Set up global handlers for the current view
            if (viewName === 'Records') {
                window.handleEditRecord = (id) => this.currentViewInstance.handleEdit(id);
                window.handleDeleteRecord = (id) => this.currentViewInstance.handleDelete(id);
            } else if (viewName === 'User Management') {
                window.handleDeactivateUser = (email) => this.currentViewInstance.handleDeactivate(email);
            }
        } catch (error) {
            console.error(`Error loading view: ${viewName}`, error);
            mainContent.innerHTML = `
                <div class="text-center py-10">
                    <h2 class="text-2xl font-bold text-red-600">Error</h2>
                    <p class="text-gray-600">Failed to load ${viewName} view.</p>
                </div>
            `;
        }
    }

    async start() {
        // Initialize navigation
        this.navigation.render();
        
        // Initialize transitions
        addViewTransitions();
        setupMobileMenuTransitions();
        
        // Set up global handlers
        window.handleEditRecord = (id) => {
            if (this.currentView === 'Records') {
                document.querySelector('records-view').handleEdit(id);
            }
        };

        window.handleDeleteRecord = (id) => {
            if (this.currentView === 'Records') {
                document.querySelector('records-view').handleDelete(id);
            }
        };

        window.handleDeactivateUser = (email) => {
            if (this.currentView === 'User Management') {
                document.querySelector('user-management-view').handleDeactivate(email);
            }
        };

        // Add transition classes to message modal
        const modal = document.getElementById('message-modal');
        if (modal) {
            modal.classList.add('transition-all', 'duration-300', 'ease-in-out', 'transform');
        }

        // Initialize data service so views receive real data
        try {
            await dataService.initialize();
        } catch (err) {
            console.warn('DataService initialization failed:', err);
        }

        // Render initial view with animation
        this.renderView('Home');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.start();
});