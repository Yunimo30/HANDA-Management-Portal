/** @jsx h */
import { h, Fragment } from 'preact';

export default class HomeView {
    constructor({ container, authService, showMessage }) {
        this.container = container;
        this.authService = authService;
        this.showMessage = showMessage;
    }

    render() {
        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h1 class="text-5xl font-extrabold text-indigo-600 mb-4">Welcome to HANDA</h1>
                    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Your city's central hub for real-time health and climate risk management.
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 text-left">
                        <div class="p-6 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Health Monitoring</h3>
                            <p class="text-gray-600">Track and analyze health incidents across different locations in real-time.</p>
                        </div>
                        <div class="p-6 bg-gray-50 rounded-lg border-l-4 border-green-500">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Climate Data</h3>
                            <p class="text-gray-600">Monitor environmental indicators and their potential impact on public health.</p>
                        </div>
                        <div class="p-6 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Risk Analysis</h3>
                            <p class="text-gray-600">Comprehensive tools for risk assessment and early warning detection.</p>
                        </div>
                    </div>

                    <button id="go-to-dashboard-btn" class="btn-primary text-lg px-8 py-3">
                        View Live Dashboard
                    </button>
                </div>

                <!-- Project Overview Section -->
                <div class="mt-12 bg-white p-8 rounded-xl shadow-lg">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">About the Project</h2>
                    <div class="text-gray-600 space-y-4">
                        <p>
                            The Health and Climate Risk Management Portal integrates validated datasets 
                            from the Project CCHAIN initiative, consolidating climate, health, and 
                            socioeconomic indicators across Philippine cities from 2003 to 2022.
                        </p>
                        <p>
                            This system centralizes and displays CCHAIN datasets to support local 
                            government units (LGUs) in assessing health and environmental risks at 
                            the community level.
                        </p>
                        <div class="mt-8 p-4 bg-indigo-50 rounded-lg">
                            <h3 class="text-xl font-semibold text-indigo-800 mb-2">Key Features:</h3>
                            <ul class="list-disc list-inside space-y-2 text-indigo-700">
                                <li>Real-time health and climate data monitoring</li>
                                <li>Interactive dashboards and visualizations</li>
                                <li>Comprehensive reporting tools</li>
                                <li>Data-driven policy planning support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for dashboard button
        document.getElementById('go-to-dashboard-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('viewChange', { detail: 'Dashboard' }));
        });
    }
}