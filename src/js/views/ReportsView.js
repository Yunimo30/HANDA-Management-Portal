export default class ReportsView {
    constructor({ container, dataService, authService, showMessage }) {
        this.container = container;
        this.dataService = dataService;
        this.authService = authService;
        this.showMessage = showMessage;
    }

    handleExport(e) {
        e.preventDefault();
        const form = e.target;
        const startDate = form.startDate.value;
        const endDate = form.endDate.value;
        const type = form.type.value;
        const location = form.location.value;
        const isPublic = !this.authService.getCurrentUser();

        try {
            let records = this.dataService.getRecords();

            // Apply filters
            records = records.filter(record => {
                // Parse dates once
                const recordDate = new Date(record.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                // Set time to midnight for accurate date comparison
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                
                // Apply filters
                const dateInRange = recordDate >= start && recordDate <= end;
                const typeMatch = type === 'all' || record.type === type;
                const locationMatch = location === 'all' || record.location?.barangay === location;
                
                return dateInRange && typeMatch && locationMatch;
            });

            // Sort records by date
            records.sort((a, b) => new Date(a.date) - new Date(b.date));

            if (records.length === 0) {
                this.showMessage('No Data', 'No records found matching the selected criteria.');
                return;
            }

            // Process records for public view if necessary
            if (isPublic) {
                records = records.map(record => ({
                    ...record,
                    // Remove or anonymize sensitive information
                    source: 'Official Health Department Data',
                    notes: record.notes ? 'Available to authorized personnel only' : '',
                    metadata: {
                        ...record.metadata,
                        createdAt: record.date // Use record date instead of actual creation date
                    }
                }));
            }

            // Convert to CSV
            const csv = this.convertToCSV(records);
            const filename = isPublic
                ? `public_health_climate_report_${startDate}_to_${endDate}.csv`
                : `health_climate_report_${startDate}_to_${endDate}.csv`;
            
            this.downloadCSV(csv, filename);
            
            const message = isPublic
                ? `${records.length} records exported successfully. This report contains public data only.`
                : `${records.length} records exported successfully.`;
            
            this.showMessage('Success', message);
        } catch (error) {
            this.showMessage('Error', error.message);
        }
    }

    convertToCSV(records) {
        // Define headers with proper column names
        const headers = [
            'Record ID',
            'Record Type',
            'City',
            'Barangay',
            'Category',
            'Value',
            'Date',
            'Source',
            'Notes',
            'Created At'
        ];

        // Process each record into a row
        const rows = records.map(r => {
            // Ensure all values are properly escaped
            const values = [
                r.id || '',
                r.type || '',
                r.location?.city || '',
                r.location?.barangay || '',
                r.category || '',
                r.value || '0',
                this.formatDate(r.date),
                r.source || '',
                r.notes || '',
                this.formatDate(r.metadata?.createdAt) || ''
            ];

            // Properly escape and quote each value
            return values.map(value => {
                if (value === null || value === undefined) {
                    return '""';
                }
                // Convert to string and escape quotes
                const stringValue = String(value).replace(/"/g, '""');
                // Wrap in quotes if contains special characters
                if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            });
        });

        // Combine headers and rows with proper line breaks
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\r\n'); // Use Windows-style line endings for better compatibility

        return csvContent;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return ''; // Invalid date
            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch (e) {
            return '';
        }
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getUniqueLocations() {
        const records = this.dataService.getRecords();
        return [...new Set(records.map(r => r.location?.barangay))].filter(Boolean);
    }

    render() {
        const user = this.authService.getCurrentUser();
        const locations = this.getUniqueLocations();
        const today = new Date().toISOString().split('T')[0];

        const isPublic = !this.authService.getCurrentUser();

        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                ${isPublic ? `
                <!-- Public Access Notice -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-lg">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-blue-800">Public Access Information</h3>
                            <div class="mt-2 text-sm text-blue-700">
                                <p>As part of our commitment to transparency and freedom of information, you can generate and download reports of public health and climate data. The data is anonymized and aggregated for public consumption.</p>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Export Form -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6">Generate Report</h3>
                    <form id="export-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" name="startDate" required class="input-field" max="${today}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" name="endDate" required class="input-field" max="${today}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Record Type</label>
                                <select name="type" required class="input-field">
                                    <option value="all">All Types</option>
                                    <option value="Health">Health</option>
                                    <option value="Climate">Climate</option>
                                    <option value="Intervention">Intervention</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Location</label>
                                <select name="location" required class="input-field">
                                    <option value="all">All Locations</option>
                                    ${locations.map(loc => `
                                        <option value="${loc}">${loc}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" class="btn-primary">
                                Generate Report
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Data Preview -->
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6">Available Data Overview</h3>
                    ${this.renderDataOverview()}
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('export-form').addEventListener('submit', this.handleExport.bind(this));
    }

    renderDataOverview() {
        const records = this.dataService.getRecords();
        const totalRecords = records.length;
        
        if (totalRecords === 0) {
            return '<p class="text-gray-500 text-center">No data available</p>';
        }

        const typeCount = records.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {});

        const dateRange = records.reduce((acc, r) => {
            const date = new Date(r.date);
            if (!acc.min || date < acc.min) acc.min = date;
            if (!acc.max || date > acc.max) acc.max = date;
            return acc;
        }, { min: null, max: null });

        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-500">Total Records</p>
                        <p class="text-2xl font-bold text-gray-900">${totalRecords}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-500">Date Range</p>
                        <p class="text-sm font-medium text-gray-900">
                            ${dateRange.min?.toLocaleDateString()} - ${dateRange.max?.toLocaleDateString()}
                        </p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-500">Record Types</p>
                        <div class="space-y-1 mt-1">
                            ${Object.entries(typeCount).map(([type, count]) => `
                                <p class="text-sm">
                                    <span class="font-medium text-gray-900">${type}:</span>
                                    <span class="text-gray-600">${count}</span>
                                </p>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p class="text-yellow-700">
                        <span class="font-medium">Note:</span>
                        The export will include all record details including notes and source information.
                    </p>
                </div>
            </div>
        `;
    }
}