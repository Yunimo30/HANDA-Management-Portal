import { Record } from '../models/Record.js';

class DataService {
    constructor() {
        this.ROOT_KEY = 'health-climate-portal';
        this.records = [];
        this.loadData();

        // Add sample data if no records exist
        if (this.records.length === 0) {
            this.initializeSampleData();
        }
    }

    initializeSampleData() {
        const sampleRecords = [
            {
                id: 1,
                type: "Health",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Dengue Cases",
                value: 15,
                date: "2025-10-01",
                source: "City Health Office",
                notes: "Increase in cases following heavy rainfall",
                metadata: { createdAt: new Date("2025-10-02").toISOString() }
            },
            {
                id: 2,
                type: "Climate",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Rainfall (mm)",
                value: 156.8,
                date: "2025-10-01",
                source: "Local Weather Station",
                notes: "Above average rainfall for October",
                metadata: { createdAt: new Date("2025-10-02").toISOString() }
            },
            {
                id: 3,
                type: "Health",
                location: { city: "Manila", barangay: "San Antonio" },
                category: "Respiratory Cases",
                value: 28,
                date: "2025-10-05",
                source: "District Hospital",
                notes: "Increasing trend in respiratory infections",
                metadata: { createdAt: new Date("2025-10-06").toISOString() }
            },
            {
                id: 4,
                type: "Climate",
                location: { city: "Manila", barangay: "San Antonio" },
                category: "Temperature (°C)",
                value: 32.5,
                date: "2025-10-05",
                source: "Environmental Monitoring Station",
                notes: "Higher than average temperature",
                metadata: { createdAt: new Date("2025-10-06").toISOString() }
            },
            {
                id: 5,
                type: "Intervention",
                location: { city: "Manila", barangay: "Poblacion" },
                category: "Fumigation",
                value: 1,
                date: "2025-10-08",
                source: "City Health Department",
                notes: "City-wide dengue prevention program",
                metadata: { createdAt: new Date("2025-10-08").toISOString() }
            },
            {
                id: 6,
                type: "Health",
                location: { city: "Manila", barangay: "Santa Mesa" },
                category: "Gastroenteritis Cases",
                value: 12,
                date: "2025-10-10",
                source: "Public Health Center",
                notes: "Cases linked to flood water exposure",
                metadata: { createdAt: new Date("2025-10-11").toISOString() }
            },
            {
                id: 7,
                type: "Climate",
                location: { city: "Manila", barangay: "Santa Mesa" },
                category: "Flood Level (cm)",
                value: 45,
                date: "2025-10-10",
                source: "Disaster Risk Management",
                notes: "Street level flooding reported",
                metadata: { createdAt: new Date("2025-10-11").toISOString() }
            },
            {
                id: 8,
                type: "Intervention",
                location: { city: "Manila", barangay: "San Antonio" },
                category: "Health Education",
                value: 1,
                date: "2025-10-12",
                source: "Public Health Department",
                notes: "Community workshop on disease prevention",
                metadata: { createdAt: new Date("2025-10-12").toISOString() }
            },
            {
                id: 9,
                type: "Health",
                location: { city: "Manila", barangay: "Bagong Silang" },
                category: "Leptospirosis Cases",
                value: 3,
                date: "2025-10-15",
                source: "Regional Hospital",
                notes: "Cases reported after flooding",
                metadata: { createdAt: new Date("2025-10-16").toISOString() }
            },
            {
                id: 10,
                type: "Climate",
                location: { city: "Manila", barangay: "Bagong Silang" },
                category: "Humidity (%)",
                value: 85,
                date: "2025-10-15",
                source: "Weather Monitoring Station",
                notes: "High humidity levels persisting",
                metadata: { createdAt: new Date("2025-10-16").toISOString() }
            }
        ];

        this.records = sampleRecords;
        this.saveData();
    }

    loadData() {
        try {
            const storedData = localStorage.getItem(this.ROOT_KEY);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.records = data.records || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.records = [];
        }
    }

    saveData() {
        try {
            const dataToStore = {
                records: this.records
            };
            localStorage.setItem(this.ROOT_KEY, JSON.stringify(dataToStore));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    addRecord(recordData) {
        try {
            Record.validate(recordData);
            const record = new Record(recordData);
            this.records.push(record);
            this.saveData();
            return record;
        } catch (error) {
            throw new Error(`Failed to add record: ${error.message}`);
        }
    }

    updateRecord(id, recordData) {
        try {
            Record.validate(recordData);
            const index = this.records.findIndex(r => r.id === id);
            if (index === -1) {
                throw new Error('Record not found');
            }
            this.records[index] = { ...this.records[index], ...recordData };
            this.saveData();
            return this.records[index];
        } catch (error) {
            throw new Error(`Failed to update record: ${error.message}`);
        }
    }

    deleteRecord(id) {
        const index = this.records.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Record not found');
        }
        this.records.splice(index, 1);
        this.saveData();
    }

    getRecords(filters = {}) {
        let filteredRecords = [...this.records];

        if (filters.type) {
            filteredRecords = filteredRecords.filter(r => r.type === filters.type);
        }

        if (filters.dateRange) {
            filteredRecords = filteredRecords.filter(r => 
                r.date >= filters.dateRange.start && r.date <= filters.dateRange.end
            );
        }

        if (filters.location) {
            filteredRecords = filteredRecords.filter(r => 
                (!filters.location.city || r.location.city === filters.location.city) &&
                (!filters.location.barangay || r.location.barangay === filters.location.barangay)
            );
        }

        return filteredRecords;
    }
}

export const dataService = new DataService();