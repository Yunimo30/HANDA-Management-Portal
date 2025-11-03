/** @jsx h */
import { h, Fragment } from 'preact';

export default class RecordsView {
    constructor({ container, dataService, authService, showMessage }) {
        this.container = container;
        this.dataService = dataService;
        this.authService = authService;
        this.showMessage = showMessage;
        this.currentRecord = null;
        this.currentPage = 1;
        this.recordsPerPage = 25; // Default page size
        this.filters = {
            type: 'all',
            location: 'all',
            category: 'all',
            startDate: '',
            endDate: '',
            search: ''
        };
        this.cachedRecords = null; // Cache for all records
        this.filteredRecords = null; // Cache for filtered records
        this.sampleData = [
            {
                type: "Health",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Dengue Cases",
                value: 15,
                date: "2025-10-01",
                source: "City Health Office",
                notes: "Increase in cases following heavy rainfall"
            },
            {
                type: "Climate",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Rainfall (mm)",
                value: 156.8,
                date: "2025-10-01",
                source: "Local Weather Station",
                notes: "Above average rainfall for October"
            },
            {
                type: "Health",
                location: { city: "Manila", barangay: "San Antonio" },
                category: "Respiratory Cases",
                value: 28,
                date: "2025-10-05",
                source: "District Hospital",
                notes: "Increasing trend in respiratory infections"
            },
            {
                type: "Climate",
                location: { city: "Manila", barangay: "San Antonio" },
                category: "Temperature (°C)",
                value: 32.5,
                date: "2025-10-05",
                source: "Environmental Monitoring Station",
                notes: "Higher than average temperature"
            },
            {
                type: "Intervention",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Fumigation",
                value: 1,
                date: "2025-10-08",
                source: "City Health Department",
                notes: "City-wide dengue prevention program"
            }
        ];
        // Available and selected columns for dynamic column display (interactive)
        this.availableColumns = [];
        this.selectedColumns = JSON.parse(localStorage.getItem('selectedColumns') || 'null') || [];
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = {
            type: form.type.value,
            location: {
                city: form.city.value,
                barangay: form.barangay.value
            },
            category: form.category.value,
            value: parseFloat(form.value.value),
            date: form.date.value,
            source: form.source.value,
            notes: form.notes.value
        };

        try {
            if (this.currentRecord) {
                this.dataService.updateRecord(this.currentRecord.id, formData);
                this.showMessage('Success', 'Record updated successfully');
            } else {
                this.dataService.addRecord(formData);
                this.showMessage('Success', 'New record added successfully');
            }
            this.currentRecord = null;
            this.render();
        } catch (error) {
            this.showMessage('Error', error.message);
        }
    }

    handleEdit(id) {
        const record = this.dataService.getRecords().find(r => r.id === id);
        if (record) {
            this.currentRecord = record;
            this.render();
            // Scroll to form
            document.getElementById('record-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDelete(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                this.dataService.deleteRecord(id);
                this.showMessage('Success', 'Record deleted successfully');
                this.render();
            } catch (error) {
                this.showMessage('Error', error.message);
            }
        }
    }

    render() {
        const user = this.authService.getCurrentUser();
        const isPublic = !user || user.role === 'Public';

        if (isPublic) {
            this.renderPublicView();
            return;
        }

        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <!-- Data Management Controls -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4">Data Management</h3>
                    <div class="flex gap-4">
                        <button 
                            id="load-sample-data"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Load Sample Data
                        </button>
                        <button 
                            id="clear-all-data"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Clear All Records
                        </button>
                    </div>
                </div>

                <!-- Record Form -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6">
                        ${this.currentRecord ? 'Edit Record' : 'Add New Record'}
                    </h3>
                    <form id="record-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Record Type</label>
                            <select name="type" required class="input-field">
                                <option value="">Select Type</option>
                                <option value="Health">Health</option>
                                <option value="Climate">Climate</option>
                                <option value="Intervention">Intervention</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" name="city" required class="input-field" value="Main City">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Barangay</label>
                            <input type="text" name="barangay" required class="input-field">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" required class="input-field" 
                                placeholder="e.g., Dengue Cases, Rainfall">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Value</label>
                            <input type="number" name="value" required step="0.01" class="input-field">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date" required class="input-field">
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700">Source</label>
                            <input type="text" name="source" required class="input-field" 
                                placeholder="e.g., City Health Office">
                        </div>

                        <div class="md:col-span-2 lg:col-span-3">
                            <label class="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea name="notes" rows="3" class="input-field"></textarea>
                        </div>

                        <div class="md:col-span-2 lg:col-span-3">
                            <button type="submit" class="btn-primary">
                                ${this.currentRecord ? 'Update Record' : 'Add Record'}
                            </button>
                            ${this.currentRecord ? `
                                <button type="button" class="btn-secondary ml-4" onclick="this.closest('form').reset()">
                                    Cancel Edit
                                </button>
                            ` : ''}
                        </div>
                    </form>
                </div>

                <!-- Filters -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Filter Records</h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                            <select id="filter-type" class="input-field">
                                <option value="all">All Types</option>
                                <option value="Health" ${this.filters.type === 'Health' ? 'selected' : ''}>Disease Cases</option>
                                <option value="Climate" ${this.filters.type === 'Climate' ? 'selected' : ''}>Climate Data</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="filter-category" class="input-field">
                                <option value="all">All Categories</option>
                                ${[...new Set(this.dataService.getRecords()
                                    .map(r => r.type === 'Health' ? r.Disease : r.category))]
                                    .filter(Boolean)
                                    .map(category => 
                                    `<option value="${category}" ${this.filters.category === category ? 'selected' : ''}>
                                        ${category}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                            <select id="filter-location" class="input-field">
                                <option value="all">All Locations</option>
                                ${[...new Set(this.dataService.getRecords()
                                    .map(r => r.location?.barangay))]
                                    .filter(Boolean)
                                    .map(barangay => 
                                    `<option value="${barangay}" ${this.filters.location === barangay ? 'selected' : ''}>
                                        ${barangay}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div class="grid grid-cols-2 gap-2">
                                <input 
                                    type="date" 
                                    id="filter-date-start" 
                                    class="input-field" 
                                    value="${this.filters.startDate}"
                                >
                                <input 
                                    type="date" 
                                    id="filter-date-end" 
                                    class="input-field"
                                    value="${this.filters.endDate}"
                                >
                            </div>
                        </div>
                        <!-- Dynamic Column Selector for Climate -->
                        <div id="column-selector-container" class="md:col-span-4">
                            <!-- Populated dynamically when Climate type is selected -->
                        </div>
                    </div>
                </div>

                <!-- Records Table -->
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="p-6 border-b">
                        <h3 class="text-2xl font-semibold text-gray-800">
                            Records List
                            <span class="text-sm font-normal text-gray-500 ml-2">
                                (${this.filterRecords(this.dataService.getRecords()).length} records)
                            </span>
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category/Disease</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value/Cases</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.renderRecordsTable()}
                            </tbody>
                        </table>
                    </div>
                    ${this.getPaginationControls(this.filterRecords(this.dataService.getRecords()).length)}
                </div>
            </div>
        `;

        // Set up all event listeners
        this.setupFilterListeners();
        const form = document.getElementById('record-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Add data management button listeners
        document.getElementById('load-sample-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to load sample data? This will not affect existing records.')) {
                this.loadSampleData();
            }
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('WARNING: This will delete ALL existing records. Are you sure you want to continue?')) {
                if (confirm('This action cannot be undone. Please confirm again to proceed.')) {
                    this.clearAllData();
                }
            }
        });

        // If editing, populate form
        if (this.currentRecord) {
            form.type.value = this.currentRecord.type;
            form.city.value = this.currentRecord.location.city;
            form.barangay.value = this.currentRecord.location.barangay;
            form.category.value = this.currentRecord.category;
            form.value.value = this.currentRecord.value;
            form.date.value = this.currentRecord.date;
            form.source.value = this.currentRecord.source || '';
            form.notes.value = this.currentRecord.notes || '';
        }
    }

    loadSampleData() {
        try {
            // Load each sample record
            this.sampleData.forEach(record => {
                this.dataService.addRecord(record);
            });
            this.showMessage('Success', 'Sample data has been loaded successfully');
            this.render();
        } catch (error) {
            this.showMessage('Error', 'Failed to load sample data: ' + error.message);
        }
    }

    clearAllData() {
        try {
            // Clear all records in the data service
            this.dataService.records = [];
            this.dataService.saveData();
            this.showMessage('Success', 'All records have been cleared');
            this.render();
        } catch (error) {
            this.showMessage('Error', 'Failed to clear data: ' + error.message);
        }
    }

    filterRecords(records) {
        return records.filter(record => {
            // Type filter
            if (this.filters.type !== 'all' && record.type !== this.filters.type) return false;
            
            // Location filter
            if (this.filters.location !== 'all' && record.location.barangay !== this.filters.location) return false;
            
            // Date range filter
            if (this.filters.startDate && new Date(record.date) < new Date(this.filters.startDate)) return false;
            if (this.filters.endDate && new Date(record.date) > new Date(this.filters.endDate)) return false;
            
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                return (
                    record.type.toLowerCase().includes(searchTerm) ||
                    record.category.toLowerCase().includes(searchTerm) ||
                    record.location.barangay.toLowerCase().includes(searchTerm) ||
                    record.location.city.toLowerCase().includes(searchTerm) ||
                    record.source?.toLowerCase().includes(searchTerm) ||
                    record.notes?.toLowerCase().includes(searchTerm)
                );
            }
            
            return true;
        });
    }

    getPaginatedRecords(records) {
        const start = (this.currentPage - 1) * this.recordsPerPage;
        return records.slice(start, start + this.recordsPerPage);
    }

    getPaginationControls(totalRecords) {
        const totalPages = Math.ceil(totalRecords / this.recordsPerPage);
        if (totalPages <= 1) return '';

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                i === this.currentPage || // Current page
                i === this.currentPage - 1 || // One before current
                i === this.currentPage + 1 // One after current
            ) {
                pages.push(i);
            } else if (
                (i === this.currentPage - 2 && this.currentPage > 3) ||
                (i === this.currentPage + 2 && this.currentPage < totalPages - 2)
            ) {
                pages.push('...');
            }
        }

        return `
            <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div class="flex items-center">
                    <span class="text-sm text-gray-700">
                        Showing ${(this.currentPage - 1) * this.recordsPerPage + 1} 
                        to ${Math.min(this.currentPage * this.recordsPerPage, totalRecords)}
                        of ${totalRecords} records
                    </span>
                    <select id="records-per-page" class="ml-4 input-field text-sm" style="width: auto">
                        <option value="10" ${this.recordsPerPage === 10 ? 'selected' : ''}>10 per page</option>
                        <option value="25" ${this.recordsPerPage === 25 ? 'selected' : ''}>25 per page</option>
                        <option value="50" ${this.recordsPerPage === 50 ? 'selected' : ''}>50 per page</option>
                        <option value="100" ${this.recordsPerPage === 100 ? 'selected' : ''}>100 per page</option>
                    </select>
                </div>
                <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button 
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        data-page="${this.currentPage - 1}"
                    >
                        Previous
                    </button>
                    ${pages.map(page => {
                        if (page === '...') {
                            return '<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>';
                        }
                        return `
                            <button 
                                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                    page === this.currentPage 
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                }"
                                data-page="${page}"
                            >
                                ${page}
                            </button>
                        `;
                    }).join('')}
                    <button 
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        data-page="${this.currentPage + 1}"
                    >
                        Next
                    </button>
                </nav>
            </div>
        `;
    }

    renderPublicView() {
        const records = this.dataService.getRecords();
        
        // Group records by type for better organization
        const groupedRecords = records.reduce((acc, record) => {
            if (!acc[record.type]) {
                acc[record.type] = [];
            }
            acc[record.type].push(record);
            return acc;
        }, {});

        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="bg-blue-50 p-6 rounded-xl mb-8">
                    <h2 class="text-2xl font-bold text-blue-800 mb-2">Public Records Access</h2>
                    <p class="text-blue-600">
                        Welcome to the public records view. Here you can access and view health and climate data for transparency and information purposes.
                    </p>
                </div>

                <!-- Filters -->
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Filter Records</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                            <select id="public-filter-type" class="input-field">
                                <option value="all">All Types</option>
                                <option value="Health">Health</option>
                                <option value="Climate">Climate</option>
                                <option value="Intervention">Intervention</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div class="grid grid-cols-2 gap-2">
                                <input type="date" id="public-filter-date-start" class="input-field">
                                <input type="date" id="public-filter-date-end" class="input-field">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <select id="public-filter-location" class="input-field">
                                <option value="all">All Locations</option>
                                ${[...new Set(records.map(r => r.location.barangay))].map(barangay => 
                                    `<option value="${barangay}">${barangay}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Records Display -->
                ${Object.entries(groupedRecords).map(([type, typeRecords]) => `
                    <div class="bg-white p-6 rounded-xl shadow-lg mb-8 record-section" data-type="${type}">
                        <h3 class="text-2xl font-semibold text-gray-800 mb-6">
                            ${type} Records
                            <span class="text-sm font-normal text-gray-500 ml-2">(${typeRecords.length} records)</span>
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${typeRecords.map(record => `
                                        <tr class="hover:bg-gray-50 record-row" 
                                            data-date="${record.date}"
                                            data-location="${record.location.barangay}">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.category}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${record.location.barangay}, ${record.location.city}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${record.value}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.source}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Set up filter event listeners
        this.setupPublicFilters();
    }

    setupPublicFilters() {
        const typeFilter = document.getElementById('public-filter-type');
        const dateStartFilter = document.getElementById('public-filter-date-start');
        const dateEndFilter = document.getElementById('public-filter-date-end');
        const locationFilter = document.getElementById('public-filter-location');

        const applyFilters = () => {
            const type = typeFilter.value;
            const startDate = dateStartFilter.value ? new Date(dateStartFilter.value) : null;
            const endDate = dateEndFilter.value ? new Date(dateEndFilter.value) : null;
            const location = locationFilter.value;

            // Show/hide sections based on type
            document.querySelectorAll('.record-section').forEach(section => {
                if (type === 'all' || section.dataset.type === type) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });

            // Filter individual rows
            document.querySelectorAll('.record-row').forEach(row => {
                let show = true;
                
                // Date filter
                if (startDate && endDate) {
                    const rowDate = new Date(row.dataset.date);
                    show = show && rowDate >= startDate && rowDate <= endDate;
                }

                // Location filter
                if (location !== 'all') {
                    show = show && row.dataset.location === location;
                }

                row.style.display = show ? 'table-row' : 'none';
            });
        };

        // Add event listeners
        typeFilter.addEventListener('change', applyFilters);
        dateStartFilter.addEventListener('change', applyFilters);
        dateEndFilter.addEventListener('change', applyFilters);
        locationFilter.addEventListener('change', applyFilters);
    }

    getPaginationControls(totalRecords) {
        const totalPages = Math.ceil(totalRecords / this.recordsPerPage);
        const pages = [];
        
        // Always show first page, last page, current page, and one page before and after current
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                i === this.currentPage || // Current page
                i === this.currentPage - 1 || // One before current
                i === this.currentPage + 1 // One after current
            ) {
                pages.push(i);
            } else if (
                (i === this.currentPage - 2 && this.currentPage > 3) ||
                (i === this.currentPage + 2 && this.currentPage < totalPages - 2)
            ) {
                pages.push('...');
            }
        }

        return `
            <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div class="flex items-center">
                    <span class="text-sm text-gray-700">
                        Showing records ${(this.currentPage - 1) * this.recordsPerPage + 1} 
                        to ${Math.min(this.currentPage * this.recordsPerPage, totalRecords)}
                        of ${totalRecords}
                    </span>
                    <select id="records-per-page" class="ml-4 input-field text-sm" style="width: auto">
                        <option value="10" ${this.recordsPerPage === 10 ? 'selected' : ''}>10 per page</option>
                        <option value="25" ${this.recordsPerPage === 25 ? 'selected' : ''}>25 per page</option>
                        <option value="50" ${this.recordsPerPage === 50 ? 'selected' : ''}>50 per page</option>
                        <option value="100" ${this.recordsPerPage === 100 ? 'selected' : ''}>100 per page</option>
                    </select>
                </div>
                <div class="flex justify-center flex-1 sm:justify-end">
                    <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button 
                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            ${this.currentPage === 1 ? 'disabled' : ''}
                            data-page="${this.currentPage - 1}"
                        >
                            Previous
                        </button>
                        ${pages.map(page => {
                            if (page === '...') {
                                return '<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>';
                            }
                            return `
                                <button 
                                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        page === this.currentPage 
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }"
                                    data-page="${page}"
                                >
                                    ${page}
                                </button>
                            `;
                        }).join('')}
                        <button 
                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            ${this.currentPage === totalPages ? 'disabled' : ''}
                            data-page="${this.currentPage + 1}"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        `;
    }

    filterRecords(records) {
        return records.filter(record => {
            // Type filter
            if (this.filters.type !== 'all' && record.type !== this.filters.type) return false;
            
            // Category filter
            if (this.filters.category !== 'all') {
                const recordCategory = record.type === 'Health' ? record.Disease : record.category;
                if (recordCategory !== this.filters.category) return false;
            }
            
            // Location filter
            if (this.filters.location !== 'all' && record.location?.barangay !== this.filters.location) return false;
            
            // Date range filter
            if (this.filters.startDate && new Date(record.date) < new Date(this.filters.startDate)) return false;
            if (this.filters.endDate && new Date(record.date) > new Date(this.filters.endDate)) return false;
            
            // Search filter (search in multiple fields)
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const recordCategory = record.type === 'Health' ? record.Disease : record.category;
                return (
                    record.type.toLowerCase().includes(searchTerm) ||
                    recordCategory?.toLowerCase().includes(searchTerm) ||
                    record.location?.barangay?.toLowerCase().includes(searchTerm) ||
                    record.location?.city?.toLowerCase().includes(searchTerm) ||
                    record.source?.toLowerCase().includes(searchTerm) ||
                    String(record.type === 'Health' ? record.Cases : record.value).toLowerCase().includes(searchTerm)
                );
            }
            
            return true;
        });
    }

    getPaginatedRecords(records) {
        const start = (this.currentPage - 1) * this.recordsPerPage;
        return records.slice(start, start + this.recordsPerPage);
    }

    renderRecordsTable(records) {
        if (!records) {
            records = this.getPaginatedRecords(this.filterRecords(this.dataService.getRecords()));
        
        if (records.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No records found
                    </td>
                </tr>
            `;
        }

        return records.map(record => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${record.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(record.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${record.type}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${record.type === 'Health' ? record.Disease : record.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${record.type === 'Health' ? record.Cases : record.value}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${record.location ? `${record.location.barangay}, ${record.location.city}` : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${record.source || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        onclick="this.handleEdit('${record.id}')"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="this.handleDelete('${record.id}')"
                        class="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
}}