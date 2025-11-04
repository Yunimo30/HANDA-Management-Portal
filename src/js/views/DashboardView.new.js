import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

export default class DashboardView {
    constructor({ container, dataService, authService, showMessage }) {
        this.container = container;
        this.dataService = dataService;
        this.authService = authService;
        this.showMessage = showMessage;
        this.healthChart = null;
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
        // Get all health records and parse dates
        let records = this.dataService.getRecords()
            .filter(r => r.type === 'Health')
            .map(r => {
                const [month, day, year] = r.date.split('/').map(Number);
                return {
                    ...r,
                    parsedDate: new Date(year, month - 1, day)
                };
            })
            .filter(r => !isNaN(r.parsedDate.getTime())); // Filter out invalid dates
        
        // Sort records by date
        records.sort((a, b) => a.parsedDate - b.parsedDate);
        
        if (timeRange !== 'all' && records.length > 0) {
            // Find the latest date in the actual data
            const latestDate = new Date(Math.max(...records.map(r => r.parsedDate.getTime())));
            const cutoffDate = new Date(latestDate);
            cutoffDate.setDate(cutoffDate.getDate() - timeRange);
            records = records.filter(r => r.parsedDate >= cutoffDate);
        }

        // Initialize data structures
        const byCategory = {};
        const byLocation = {};
        const byDate = {};
        const metrics = new Set();

        // Process records
        records.forEach(record => {
            // Use original date string for consistency
            const dateStr = record.date;
            
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
            if (!byDate[dateStr]) {
                byDate[dateStr] = {};
            }
            if (!byDate[dateStr][record.category]) {
                byDate[dateStr][record.category] = 0;
            }
            byDate[dateStr][record.category] += Number(record.value);
            
            // Collect unique diseases
            metrics.add(record.category);
        });

        // Return processed data
        return {
            byCategory,
            byLocation,
            byDate,
            metrics: Array.from(metrics),
            dates: Object.keys(byDate).sort((a, b) => {
                const [aMonth, aDay, aYear] = a.split('/').map(Number);
                const [bMonth, bDay, bYear] = b.split('/').map(Number);
                return new Date(aYear, aMonth - 1, aDay) - new Date(bYear, bMonth - 1, bDay);
            })
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
        // Sort metrics by total cases to show most significant diseases first
        const sortedMetrics = [...data.metrics].sort((a, b) => {
            const totalA = data.dates.reduce((sum, date) => sum + (data.byDate[date][a] || 0), 0);
            const totalB = data.dates.reduce((sum, date) => sum + (data.byDate[date][b] || 0), 0);
            return totalB - totalA;
        });

        const datasets = sortedMetrics.map((metric, index) => {
            const color = this.getColors(data.metrics.length)[index];
            return {
                label: metric,
                data: data.dates.map(date => ({
                    x: new Date(date),
                    y: data.byDate[date][metric] || 0
                })),
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: true
            };
        });

        return {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Disease Cases Trend Analysis',
                        font: { size: 16 }
                    },
                    tooltip: { 
                        mode: 'index', 
                        intersect: false,
                        callbacks: {
                            title: (context) => {
                                return new Date(context[0].parsed.x).toLocaleDateString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: { 
                                day: 'MMM d, yyyy'
                            }
                        },
                        title: { display: true, text: 'Date' },
                        grid: { display: false }
                    },
                    y: {
                        title: { 
                            display: true, 
                            text: 'Number of Cases',
                            font: { size: 12 }
                        },
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            stepSize: 1
                        }
                    }
                }
            }
        };
    }

    renderBarChart(data) {
        // Get top 10 diseases by case count for better readability
        const categories = Object.keys(data.byCategory)
            .filter(cat => data.byCategory[cat] > 0) // Only include diseases with cases
            .sort((a, b) => data.byCategory[b] - data.byCategory[a])
            .slice(0, 10);
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
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Top 10 Diseases by Case Count',
                        font: { size: 16 }
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.x} cases`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Total Cases' },
                        ticks: {
                            precision: 0,
                            stepSize: 1
                        }
                    },
                    y: {
                        ticks: {
                            callback: (value) => {
                                const label = categories[value];
                                return label.length > 25 ? label.substr(0, 22) + '...' : label;
                            }
                        }
                    }
                }
            }
        };
    }

    renderPieChart(data) {
        // Get top 8 diseases with non-zero cases
        const categories = Object.keys(data.byCategory)
            .filter(cat => data.byCategory[cat] > 0)
            .sort((a, b) => data.byCategory[b] - data.byCategory[a])
            .slice(0, 8);
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
                    title: { 
                        display: true, 
                        text: 'Distribution of Active Disease Cases',
                        font: { size: 16 }
                    },
                    legend: { 
                        position: 'right',
                        labels: {
                            font: { size: 11 },
                            boxWidth: 15,
                            generateLabels: (chart) => {
                                const dataset = chart.data.datasets[0];
                                return chart.data.labels.map((label, index) => {
                                    const value = dataset.data[index];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${value} cases, ${percentage}%)`,
                                        fillStyle: dataset.backgroundColor[index],
                                        strokeStyle: dataset.borderColor[index],
                                        lineWidth: 1,
                                        hidden: false,
                                        index: index
                                    };
                                });
                            }
                        }
                    }
                }
            }
        };
    }

    renderRadarChart(data) {
        // Get locations with actual cases
        const locations = Object.keys(data.byLocation)
            .filter(loc => data.byLocation[loc] > 0)
            .sort((a, b) => data.byLocation[b] - data.byLocation[a])
            .slice(0, 5);
        
        // Get diseases with actual cases
        const categories = Object.keys(data.byCategory)
            .filter(cat => data.byCategory[cat] > 0)
            .sort((a, b) => data.byCategory[b] - data.byCategory[a])
            .slice(0, 6);
        
        const datasets = locations.map((location, index) => {
            const color = this.getColors(locations.length)[index];
            return {
                label: location || 'Unspecified Location',
                data: categories.map(cat => {
                    const locationRecords = this.dataService.getRecords()
                        .filter(r => r.type === 'Health' && 
                                r.location?.barangay === location &&
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
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        pointLabels: {
                            font: {
                                size: 11
                            },
                            callback: function(label) {
                                return label.length > 20 ? label.substring(0, 17) + '...' : label;
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Disease Cases by Location',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            font: { size: 11 },
                            boxWidth: 15,
                            generateLabels: (chart) => {
                                return chart.data.datasets.map(dataset => {
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    return {
                                        text: `${dataset.label} (${total} total cases)`,
                                        fillStyle: dataset.backgroundColor,
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: 1,
                                        hidden: false
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return ` ${context.dataset.label}: ${context.raw} cases`;
                            }
                        }
                    }
                }
            }
        };
    }

    initializeCharts() {
        const chartType = document.getElementById('health-chart-type').value;
        const timeRange = parseInt(document.getElementById('health-time-range').value);
        const data = this.prepareHealthData(timeRange);
        const healthCtx = document.getElementById('health-chart').getContext('2d');

        if (this.healthChart) {
            this.healthChart.destroy();
        }

        let chartConfig;
        switch (chartType) {
            case 'bar':
                chartConfig = this.renderBarChart(data);
                break;
            case 'pie':
                chartConfig = this.renderPieChart(data);
                break;
            case 'radar':
                chartConfig = this.renderRadarChart(data);
                break;
            case 'line':
            default:
                chartConfig = this.renderLineChart(data);
                break;
        }

        this.healthChart = new Chart(healthCtx, chartConfig);
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
                                    <option value="7">Last 7 Days of Data</option>
                                    <option value="30" selected>Last 30 Days of Data</option>
                                    <option value="90">Last 90 Days of Data</option>
                                    <option value="all">Full 2022 Dataset</option>
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
        const chartTypeSelect = document.getElementById('health-chart-type');
        const timeRangeSelect = document.getElementById('health-time-range');
        
        if (chartTypeSelect && timeRangeSelect) {
            chartTypeSelect.addEventListener('change', () => this.initializeCharts());
            timeRangeSelect.addEventListener('change', () => this.initializeCharts());
        }

        // Initialize charts
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
}