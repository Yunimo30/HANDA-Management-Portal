import Chart from 'chart.js/auto';

export default class DashboardView {
    constructor({ container, dataService, authService, showMessage }) {
        this.container = container;
        this.dataService = dataService;
        this.authService = authService;
        this.showMessage = showMessage;
    }

    calculateSummaryData() {
        const records = this.dataService.getRecords();
        const healthRecords = records.filter(r => r.type === 'Health');
        const climateRecords = records.filter(r => r.type === 'Climate');
        
        // Get unique locations
        const locations = [...new Set(records.map(r => r.location?.barangay))];
        
        // Get records from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo);

        return {
            totalRecords: records.length,
            healthRecords: healthRecords.length,
            climateRecords: climateRecords.length,
            locations: locations.length,
            recentRecords: recentRecords.length
        };
    }

    render() {
        const summary = this.calculateSummaryData();
        
        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
                    <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
                        <p class="text-sm font-medium text-gray-500">Total Records</p>
                        <p class="text-4xl font-bold text-indigo-600 mt-1">${summary.totalRecords}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
                        <p class="text-sm font-medium text-gray-500">Health Records</p>
                        <p class="text-4xl font-bold text-green-600 mt-1">${summary.healthRecords}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
                        <p class="text-sm font-medium text-gray-500">Climate Records</p>
                        <p class="text-4xl font-bold text-blue-600 mt-1">${summary.climateRecords}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-yellow-500">
                        <p class="text-sm font-medium text-gray-500">Locations Tracked</p>
                        <p class="text-4xl font-bold text-yellow-600 mt-1">${summary.locations}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-purple-500">
                        <p class="text-sm font-medium text-gray-500">Records (30 days)</p>
                        <p class="text-4xl font-bold text-purple-600 mt-1">${summary.recentRecords}</p>
                    </div>
                </div>

                <!-- Main Dashboard Content -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Health Trends -->
                    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-semibold text-gray-800">Health Trends</h3>
                            <div class="flex space-x-2">
                                <select id="health-chart-type" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="line">Timeline View</option>
                                    <option value="bar">Category Comparison</option>
                                    <option value="pie">Distribution Analysis</option>
                                    <option value="radar">Multi-metric Analysis</option>
                                    <option value="heatmap">Geographic Distribution</option>
                                </select>
                                <select id="health-time-range" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="7">Last 7 Days</option>
                                    <option value="30" selected>Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                    <option value="180">Last 6 Months</option>
                                    <option value="365">Last Year</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                        </div>
                        <div class="relative h-80">
                            <canvas id="health-chart" class="w-full h-full"></canvas>
                        </div>
                    </div>

                    <!-- Climate Data -->
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Climate Data</h3>
                        <div id="climate-chart" class="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p class="text-gray-500">Climate data visualization will be implemented here</p>
                        </div>
                    </div>

                    <!-- Risk Map -->
                    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Risk Map</h3>
                        <div id="risk-map" class="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p class="text-gray-500">Geographic risk visualization will be implemented here</p>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                        <div class="space-y-4">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // We'll implement charts and maps later
        this.initializeCharts();
    }

    renderRecentActivity() {
        const records = this.dataService.getRecords();
        const recentRecords = records
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentRecords.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No recent activity</p>';
        }

        return recentRecords.map(record => `
            <div class="p-4 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-gray-800">${record.type}</p>
                        <p class="text-sm text-gray-600">${record.location?.barangay || 'N/A'}</p>
                    </div>
                    <span class="text-sm text-gray-500">${new Date(record.date).toLocaleDateString()}</span>
                </div>
                <p class="mt-2 text-sm text-gray-600">${record.category}: ${record.value}</p>
            </div>
        `).join('');
    }

    prepareHealthTrendsData() {
        const records = this.dataService.getRecords().filter(r => r.type === 'Health');
        
        // Group records by category and date
        const groupedData = {};
        records.forEach(record => {
            if (!groupedData[record.category]) {
                groupedData[record.category] = {};
            }
            const date = record.date.split('T')[0]; // Handle both date strings and date objects
            groupedData[record.category][date] = (groupedData[record.category][date] || 0) + Number(record.value);
        });

        // Get unique dates and categories
        const dates = [...new Set(records.map(r => r.date.split('T')[0]))].sort();
        const categories = Object.keys(groupedData);

        // Prepare datasets
        const datasets = categories.map(category => {
            const color = this.getRandomColor();
            return {
                label: category,
                data: dates.map(date => groupedData[category][date] || 0),
                borderColor: color,
                backgroundColor: color + '20', // Add transparency
                tension: 0.4,
                fill: true
            };
        });

        return { dates, datasets };
    }

    getRandomColor() {
        const colors = [
            '#4C51BF', // Indigo
            '#38A169', // Green
            '#E53E3E', // Red
            '#D69E2E', // Yellow
            '#805AD5', // Purple
            '#3182CE', // Blue
            '#DD6B20', // Orange
            '#38B2AC'  // Teal
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    initializeCharts() {
        // Initialize Health Trends Chart
        const healthCtx = document.getElementById('health-chart').getContext('2d');
        const { dates, datasets } = this.prepareHealthTrendsData();
        
        if (this.healthChart) {
            this.healthChart.destroy();
        }

        this.healthChart = new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Health Incidents Over Time'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Number of Cases'
                        },
                        beginAtZero: true,
                        grid: {
                            color: '#E2E8F0'
                        }
                    }
                }
            }
        });
    }
}