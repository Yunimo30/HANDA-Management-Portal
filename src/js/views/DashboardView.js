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
                        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Health Trends</h3>
                        <div id="health-chart" class="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p class="text-gray-500">Health trends visualization will be implemented here</p>
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

    initializeCharts() {
        // TODO: Implement charts using Chart.js or similar library
        // We'll add this functionality later
    }
}