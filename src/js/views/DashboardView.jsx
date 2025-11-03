import Chart from 'chart.js/auto';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/** @jsx h */
import { h, Fragment } from 'preact';
import Chart from 'chart.js/auto';

export default class DashboardView {
    constructor({ container, dataService, authService, showMessage }) {
        this.container = container;
        this.dataService = dataService;
        this.authService = authService;
        this.showMessage = showMessage;
        this.healthChart = null;
        this.climateChart = null;
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

    prepareHealthData(timeRange = 30) {
        let records = this.dataService.getRecords().filter(r => r.type === 'Health');
        
        // Apply time range filter
        if (timeRange !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - timeRange);
            records = records.filter(r => new Date(r.date) >= cutoffDate);
        }

        // Group records by various dimensions
        const byCategory = {};
        const byLocation = {};
        const byDate = {};
        const metrics = new Set();

        records.forEach(record => {
            // Category grouping
            if (!byCategory[record.category]) {
                byCategory[record.category] = 0;
            }
            byCategory[record.category] += Number(record.value);

            // Location grouping
            const location = record.location.barangay;
            if (!byLocation[location]) {
                byLocation[location] = 0;
            }
            byLocation[location] += Number(record.value);

            // Date grouping
            const date = record.date.split('T')[0];
            if (!byDate[date]) {
                byDate[date] = {};
            }
            if (!byDate[date][record.category]) {
                byDate[date][record.category] = 0;
            }
            byDate[date][record.category] += Number(record.value);

            // Collect unique metrics
            metrics.add(record.category);
        });

        return {
            byCategory,
            byLocation,
            byDate,
            metrics: Array.from(metrics),
            dates: Object.keys(byDate).sort()
        };
    }

    prepareClimateData(timeRange = 30) {
        let records = this.dataService.getRecords().filter(r => r.type === 'Climate');
        
        // Apply time range filter
        if (timeRange !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - timeRange);
            records = records.filter(r => new Date(r.date) >= cutoffDate);
        }

        // Group records by various dimensions
        const byCategory = {};
        const byLocation = {};
        const byDate = {};
        const metrics = new Set();

        records.forEach(record => {
            // Category grouping
            if (!byCategory[record.category]) {
                byCategory[record.category] = 0;
            }
            byCategory[record.category] += Number(record.value);

            // Location grouping
            const location = record.location.barangay;
            if (!byLocation[location]) {
                byLocation[location] = 0;
            }
            byLocation[location] += Number(record.value);

            // Date grouping
            const date = record.date.split('T')[0];
            if (!byDate[date]) {
                byDate[date] = {};
            }
            if (!byDate[date][record.category]) {
                byDate[date][record.category] = 0;
            }
            byDate[date][record.category] += Number(record.value);

            // Collect unique metrics
            metrics.add(record.category);
        });

        return {
            byCategory,
            byLocation,
            byDate,
            metrics: Array.from(metrics),
            dates: Object.keys(byDate).sort()
        };
    }

    getColors(count) {
        const baseColors = [
            '#4C51BF', // Indigo
            '#38A169', // Green
            '#E53E3E', // Red
            '#D69E2E', // Yellow
            '#805AD5', // Purple
            '#3182CE', // Blue
            '#DD6B20', // Orange
            '#38B2AC'  // Teal
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    renderLineChart(data) {
        const datasets = data.metrics.map((metric, index) => {
            const color = this.getColors(data.metrics.length)[index];
            return {
                label: metric,
                data: data.dates.map(date => data.byDate[date][metric] || 0),
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: true
            };
        });

        return {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Health Incidents Over Time' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Date' },
                        grid: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Number of Cases' },
                        beginAtZero: true
                    }
                }
            }
        };
    }

    renderBarChart(data) {
        const categories = Object.keys(data.byCategory);
        const values = categories.map(cat => data.byCategory[cat]);
        const colors = this.getColors(categories.length);

        return {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Health Incidents by Category' },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Total Cases' }
                    }
                }
            }
        };
    }

    renderPieChart(data) {
        const categories = Object.keys(data.byCategory);
        const values = categories.map(cat => data.byCategory[cat]);
        const colors = this.getColors(categories.length);

        return {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c + '80'),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Distribution of Health Incidents' },
                    legend: { position: 'right' }
                }
            }
        };
    }

    renderRadarChart(data) {
        const locations = Object.keys(data.byLocation);
        const categories = data.metrics;
        
        const datasets = locations.map((location, index) => {
            const color = this.getColors(locations.length)[index];
            return {
                label: location,
                data: categories.map(cat => {
                    const locationRecords = this.dataService.getRecords()
                        .filter(r => r.type === 'Health' && 
                                r.location.barangay === location &&
                                r.category === cat);
                    return locationRecords.reduce((sum, r) => sum + Number(r.value), 0);
                }),
                borderColor: color,
                backgroundColor: color + '40'
            };
        });

        return {
            type: 'radar',
            data: {
                labels: categories,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Health Metrics by Location' }
                },
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    calculateRiskIndex(location, metric, timeRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);
        const records = this.dataService.getRecords().filter(r => 
            r.location.barangay === location && 
            new Date(r.date) >= cutoffDate
        );

        let healthRisk = 0;
        let climateRisk = 0;

        if (metric === 'health' || metric === 'combined') {
            const healthRecords = records.filter(r => r.type === 'Health');
            // Calculate health risk based on number of cases and severity
            healthRisk = healthRecords.reduce((risk, record) => {
                const severity = this.getHealthSeverity(record.category);
                return risk + (Number(record.value) * severity);
            }, 0) / (healthRecords.length || 1);
        }

        if (metric === 'climate' || metric === 'combined') {
            const climateRecords = records.filter(r => r.type === 'Climate');
            // Calculate climate risk based on environmental factors
            climateRisk = climateRecords.reduce((risk, record) => {
                const severity = this.getClimateSeverity(record.category, record.value);
                return risk + severity;
            }, 0) / (climateRecords.length || 1);
        }

        if (metric === 'combined') {
            return (healthRisk + climateRisk) / 2;
        }
        return metric === 'health' ? healthRisk : climateRisk;
    }

    getHealthSeverity(category) {
        // Define severity weights for different health categories
        const severityMap = {
            'Dengue Cases': 0.8,
            'Respiratory Cases': 0.6,
            'Gastroenteritis Cases': 0.5,
            'Leptospirosis Cases': 0.7
        };
        return severityMap[category] || 0.5;
    }

    getClimateSeverity(category, value) {
        // Define threshold-based severity for climate metrics
        switch (category) {
            case 'Rainfall (mm)':
                if (value > 150) return 0.9;
                if (value > 100) return 0.6;
                if (value > 50) return 0.3;
                return 0.1;
            case 'Temperature (°C)':
                if (value > 35) return 0.8;
                if (value > 30) return 0.5;
                if (value > 25) return 0.3;
                return 0.1;
            case 'Humidity (%)':
                if (value > 85) return 0.7;
                if (value > 70) return 0.4;
                return 0.2;
            case 'Flood Level (cm)':
                if (value > 100) return 1.0;
                if (value > 50) return 0.7;
                if (value > 20) return 0.4;
                return 0.2;
            default:
                return 0.5;
        }
    }

    getRiskColor(riskIndex) {
        if (riskIndex >= 0.7) return '#EF4444'; // red-500
        if (riskIndex >= 0.4) return '#F59E0B'; // yellow-500
        return '#10B981'; // green-500
    }

    initializeRiskMap() {
        // Initialize the map if it doesn't exist
        if (!this.riskMap) {
            this.riskMap = L.map('risk-map').setView([14.6091, 121.0223], 12); // Manila coordinates
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.riskMap);
        }

        // Get current selections
        const metric = document.getElementById('risk-map-metric').value;
        const timeRange = parseInt(document.getElementById('risk-map-timeframe').value);

        // Clear existing markers
        if (this.riskMarkers) {
            this.riskMarkers.forEach(marker => marker.remove());
        }
        this.riskMarkers = [];

        // Get unique locations
        const locations = [...new Set(this.dataService.getRecords().map(r => r.location.barangay))];

        // Add markers for each location
        locations.forEach(location => {
            const riskIndex = this.calculateRiskIndex(location, metric, timeRange);
            const color = this.getRiskColor(riskIndex);

            // Create circular marker
            const marker = L.circleMarker([
                14.6091 + (Math.random() - 0.5) * 0.05, // Random offset for demo
                121.0223 + (Math.random() - 0.5) * 0.05  // Random offset for demo
            ], {
                radius: 10,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.riskMap);

            // Add popup
            marker.bindPopup(this.createRiskPopup(location, riskIndex, metric));
            this.riskMarkers.push(marker);
        });
    }

    createRiskPopup(location, riskIndex, metric) {
        const riskLevel = riskIndex >= 0.7 ? 'High' : riskIndex >= 0.4 ? 'Medium' : 'Low';
        const percentage = Math.round(riskIndex * 100);
        
        return `
            <div class="p-2">
                <h4 class="font-bold">${location}</h4>
                <p class="text-sm mt-1">Risk Level: <span class="font-semibold">${riskLevel}</span></p>
                <p class="text-sm">Risk Index: <span class="font-semibold">${percentage}%</span></p>
                <div class="mt-2 text-xs">
                    ${this.getRiskDetails(location, metric)}
                </div>
            </div>
        `;
    }

    getRiskDetails(location, metric) {
        const records = this.dataService.getRecords()
            .filter(r => r.location.barangay === location)
            .slice(-5);

        return `
            <p class="font-semibold mb-1">Recent Incidents:</p>
            ${records.map(r => `
                <div class="mb-1">
                    <span class="text-gray-600">${r.category}:</span>
                    ${r.value} (${new Date(r.date).toLocaleDateString()})
                </div>
            `).join('')}
        `;
    }

    initializeCharts() {
        // Health Chart
        const healthChartType = document.getElementById('health-chart-type').value;
        const healthTimeRange = parseInt(document.getElementById('health-time-range').value);
        const healthData = this.prepareHealthData(healthTimeRange);
        const healthCtx = document.getElementById('health-chart').getContext('2d');

        if (this.healthChart) {
            this.healthChart.destroy();
        }

        let healthChartConfig;
        switch (healthChartType) {
            case 'bar':
                healthChartConfig = this.renderBarChart(healthData, 'Health Incidents by Category');
                break;
            case 'pie':
                healthChartConfig = this.renderPieChart(healthData, 'Distribution of Health Incidents');
                break;
            default:
                healthChartConfig = this.renderLineChart(healthData, 'Health Incidents Over Time');
                break;
        }

        this.healthChart = new Chart(healthCtx, healthChartConfig);

        // Climate Chart
        const climateChartType = document.getElementById('climate-chart-type').value;
        const climateTimeRange = parseInt(document.getElementById('climate-time-range').value);
        const climateData = this.prepareClimateData(climateTimeRange);
        const climateCtx = document.getElementById('climate-chart').getContext('2d');

        if (this.climateChart) {
            this.climateChart.destroy();
        }

        let climateChartConfig;
        switch (climateChartType) {
            case 'bar':
                climateChartConfig = this.renderBarChart(climateData, 'Climate Events by Category');
                break;
            case 'pie':
                climateChartConfig = this.renderPieChart(climateData, 'Distribution of Climate Events');
                break;
            default:
                climateChartConfig = this.renderLineChart(climateData, 'Climate Events Over Time');
                break;
        }

        this.climateChart = new Chart(climateCtx, climateChartConfig);
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
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-semibold text-gray-800">Climate Data</h3>
                            <div class="flex space-x-2">
                                <select id="climate-chart-type" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="line">Timeline View</option>
                                    <option value="bar">Category Comparison</option>
                                    <option value="pie">Distribution Analysis</option>
                                </select>
                                <select id="climate-time-range" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
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
                            <canvas id="climate-chart"></canvas>
                        </div>
                    </div>

                    <!-- Risk Map -->
                    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-semibold text-gray-800">Risk Map</h3>
                            <div class="flex space-x-2">
                                <select id="risk-map-metric" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="health">Health Risk Index</option>
                                    <option value="climate">Climate Risk Index</option>
                                    <option value="combined">Combined Risk Index</option>
                                </select>
                                <select id="risk-map-timeframe" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                    <option value="180">Last 6 Months</option>
                                    <option value="365">Last Year</option>
                                </select>
                            </div>
                        </div>
                        <div id="risk-map" class="h-96 rounded-lg"></div>
                        <div class="mt-4 flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center">
                                    <div class="w-4 h-4 rounded bg-green-500"></div>
                                    <span class="ml-2 text-sm">Low Risk</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 rounded bg-yellow-500"></div>
                                    <span class="ml-2 text-sm">Medium Risk</span>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 rounded bg-red-500"></div>
                                    <span class="ml-2 text-sm">High Risk</span>
                                </div>
                            </div>
                            <button id="risk-map-reset" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                                Reset View
                            </button>
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

        // Set up chart control event listeners
        const chartControls = [
            'health-chart-type',
            'health-time-range',
            'climate-chart-type',
            'climate-time-range'
        ];
        
        chartControls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.addEventListener('change', () => this.initializeCharts());
            }
        });

        // Initialize charts
        this.initializeCharts();

        // Initialize risk map
        this.initializeRiskMap();

        // Set up risk map control listeners
        const riskMapMetric = document.getElementById('risk-map-metric');
        const riskMapTimeframe = document.getElementById('risk-map-timeframe');
        const riskMapReset = document.getElementById('risk-map-reset');

        if (riskMapMetric && riskMapTimeframe && riskMapReset) {
            riskMapMetric.addEventListener('change', () => this.initializeRiskMap());
            riskMapTimeframe.addEventListener('change', () => this.initializeRiskMap());
            riskMapReset.addEventListener('click', () => {
                if (this.riskMap) {
                    this.riskMap.setView([14.6091, 121.0223], 12);
                }
            });
        }
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
}