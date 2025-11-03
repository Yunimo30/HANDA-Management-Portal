class DataService {
    constructor() {
        this.records = [];
    }

    async initialize() {
        await this.loadData();
    }

    async loadData() {
        try {
            // Load climate/weather dataset
            const response = await fetch('/sampledDataset.csv');
            const csvText = await response.text();
            const climateRows = this.parseCSV(csvText);
            const climateRecords = climateRows.map(record => this.createRecordFromCSV(record));

            // Load disease dataset (health records)
            let diseaseRecords = [];
            try {
                const dResp = await fetch('/sampledDiseaseDataset.csv');
                if (dResp.ok) {
                    const dText = await dResp.text();
                    const diseaseRows = this.parseCSV(dText);
                    diseaseRecords = diseaseRows.map(r => this.createHealthRecordFromDiseaseCSV(r));
                }
            } catch (err) {
                console.warn('No disease dataset found or failed to load:', err);
            }

            // Combine datasets
            this.records = [...climateRecords, ...diseaseRecords];
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    parseCSV(csvText) {
        // Split the CSV into lines
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        return lines.slice(1)
            .filter(line => line.trim()) // Skip empty lines
            .map(line => {
                const values = line.split(',');
                const record = {};
                headers.forEach((header, index) => {
                    if (header === 'date') {
                        record[header] = values[index];
                    } else if (['tave', 'tmin', 'tmax', 'heat_index', 'wind_speed', 'rh', 'solar_rad', 'uv_rad'].includes(header)) {
                        record[header] = parseFloat(values[index]);
                    } else {
                        record[header] = values[index];
                    }
                });
                return record;
            });
    }

    createRecordFromCSV(csvRecord) {
        // Transform CSV record into our application record format
        return {
            id: csvRecord.uuid,
            type: 'Climate',
            location: {
                city: csvRecord.City,
                barangay: csvRecord.Barangay
            },
            metrics: {
                temperature: {
                    average: csvRecord.tave,
                    min: csvRecord.tmin,
                    max: csvRecord.tmax,
                    heatIndex: csvRecord.heat_index
                },
                wind: {
                    speed: csvRecord.wind_speed
                },
                humidity: csvRecord.rh,
                radiation: {
                    solar: csvRecord.solar_rad,
                    uv: csvRecord.uv_rad
                }
            },
            date: csvRecord.date,
            source: 'Weather Station',
            metadata: {
                createdAt: new Date().toISOString()
            }
        };
    }

    createHealthRecordFromDiseaseCSV(csvRecord) {
        // sampledDiseaseDataset.csv fields: Id,Date,Disease,Cases,Source
        return {
            id: csvRecord.Id || csvRecord.id,
            type: 'Health',
            category: csvRecord.Disease || csvRecord.disease || 'Unknown Disease',
            value: Number(csvRecord.Cases || csvRecord.cases || 0),
            location: {
                // Disease dataset doesn't include location; use a default placeholder
                city: csvRecord.City || 'Sample City',
                barangay: csvRecord.Barangay || 'Citywide'
            },
            date: csvRecord.Date || csvRecord.date,
            source: csvRecord.Source || 'PIDSR',
            metadata: { importedFrom: 'sampledDiseaseDataset.csv' }
        };
    }

    getRecords(filters = {}) {
        let filteredRecords = [...this.records];

        if (filters.type) {
            filteredRecords = filteredRecords.filter(r => r.type === filters.type);
        }

        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            filteredRecords = filteredRecords.filter(r => {
                const recordDate = new Date(r.date);
                return recordDate >= startDate && recordDate <= endDate;
            });
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