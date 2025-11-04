import ClimateDataService from './ClimateDataService.js';

class DataService {
    constructor() {
        this.records = [];
        // store discovered headers for each CSV
        this.climateHeaders = [];
        this.diseaseHeaders = [];
        // allow manual field mapping if UI wants to set it
        this.fieldMappings = {
            Climate: null,
            Health: null
        };
        // instantiate climate service so we can load climate data into it
        this.climateService = new ClimateDataService();
    }

    async initialize() {
        await this.loadData();
    }

    // Public: allow UI to set a mapping from CSV header -> internal field name
    setFieldMapping(type, mapping) {
        this.fieldMappings[type] = mapping;
    }

    getFieldMapping(type) {
        return this.fieldMappings[type] || null;
    }

    // Return available columns discovered for a dataset type
    getAvailableColumns(type) {
        if (type === 'Climate') return this.climateHeaders;
        if (type === 'Health') return this.diseaseHeaders;
        return [];
    }

    async loadData() {
        try {
            // Load climate dataset
            const response = await fetch('/climate_100.csv');
            const csvText = await response.text();
            const climateRows = this.parseCSV(csvText);
            // store headers discovered
            this.climateHeaders = climateRows.length > 0 ? Object.keys(climateRows[0]) : [];
            const climateRecords = climateRows.map(record => this.createClimateRecord(record));
            // Load into ClimateDataService (flat records expected)
            try {
                await this.climateService.loadClimateData(climateRecords);
            } catch (e) {
                console.warn('Failed to load climate data into ClimateDataService:', e);
            }

            // Load disease dataset
            let diseaseRecords = [];
            try {
                const dResp = await fetch('/disease_100.csv');
                if (dResp.ok) {
                    const dText = await dResp.text();
                    const diseaseRows = this.parseCSV(dText);
                    this.diseaseHeaders = diseaseRows.length > 0 ? Object.keys(diseaseRows[0]) : [];
                    diseaseRecords = diseaseRows.map(r => this.createDiseaseRecord(r));
                }
            } catch (err) {
                console.warn('No disease dataset found or failed to load:', err);
            }

            // Combine
            this.records = [...climateRecords, ...diseaseRecords];
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    // Robust CSV line parser that handles quoted fields and commas inside quotes
    parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) return [];

        const headers = this._csvLineToArray(lines[0]).map(h => h.trim());

        return lines.slice(1)
            .map(line => this._csvLineToArray(line))
            .filter(values => values.length > 0 && !(values.length === 1 && values[0] === ''))
            .map(values => {
                const obj = {};
                headers.forEach((header, i) => {
                    let v = values[i] !== undefined ? values[i].trim() : '';
                    // Convert numeric-looking values to numbers
                    if (v !== '' && !isNaN(v)) {
                        // but keep leading zeros as strings if desired -- here we convert
                        v = Number(v);
                    }
                    obj[header] = v;
                });
                return obj;
            });
    }

    // Helper: parse a CSV line into array respecting quotes
    _csvLineToArray(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                // If next char is also a quote, it's an escaped quote
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }
            if (ch === ',' && !inQuotes) {
                result.push(current);
                current = '';
                continue;
            }
            current += ch;
        }
        result.push(current);
        return result;
    }

    // Create a Climate record that includes both flat fields (for ClimateDataService) and nested metrics (for existing views)
    createClimateRecord(csvRecord) {
        // Normalize keys (case-insensitive) for common headers
        const get = key => csvRecord[key] ?? csvRecord[key.toLowerCase()] ?? csvRecord[key.toUpperCase()];

        const id = get('uuid') || get('id') || null;
        const date = get('date') || get('Date') || null;
        const barangay = get('Barangay') || get('barangay') || get('location') || 'Unknown';
        const city = get('City') || get('city') || 'Unknown';

        const tave = Number(get('tave') ?? get('TAVE') ?? get('temperature') ?? 0) || 0;
        const tmin = Number(get('tmin') ?? get('TMIN') ?? 0) || 0;
        const tmax = Number(get('tmax') ?? get('TMAX') ?? 0) || 0;
        const heat_index = Number(get('heat_index') ?? get('heatindex') ?? 0) || 0;
        const wind_speed = Number(get('wind_speed') ?? get('wind') ?? 0) || 0;
        const rh = Number(get('rh') ?? get('humidity') ?? 0) || 0;
        const solar_rad = Number(get('solar_rad') ?? get('solar') ?? 0) || 0;
        const uv_rad = Number(get('uv_rad') ?? get('uv') ?? 0) || 0;

        // Some climate datasets may include soil/rain fields
        const soil_moisture = Number(get('soil_moisture') ?? get('soilmoisture') ?? 0) || 0;
        const soil_temperature = Number(get('soil_temperature') ?? get('soiltemp') ?? 0) || 0;
        const rainfall = Number(get('rainfall') ?? get('rain') ?? 0) || 0;

        return {
            id: id,
            type: 'Climate',
            location: { city, barangay },
            // Flat fields expected by ClimateDataService
            date,
            time: get('time') || null,
            temperature: tave,
            tmin,
            tmax,
            heat_index,
            humidity: rh,
            wind_speed,
            solar_rad,
            uv_rad,
            soil_moisture,
            soil_temperature,
            rainfall,
            // Nested metrics for backwards compatibility with views
            metrics: {
                temperature: { average: tave, min: tmin, max: tmax, heatIndex: heat_index },
                wind: { speed: wind_speed },
                humidity: rh,
                radiation: { solar: solar_rad, uv: uv_rad }
            },
            source: get('source') || 'Weather Station',
            metadata: { importedFrom: 'climate_100.csv' }
        };
    }

    // Create a Health/Disease record with expanded fields
    createDiseaseRecord(csvRecord) {
        const get = key => csvRecord[key] ?? csvRecord[key.toLowerCase()] ?? csvRecord[key.toUpperCase()];
        const id = get('Id') || get('ID') || get('id') || null;
        const rawDate = get('Date') || get('date') || null;
        // Ensure date is properly formatted (handle mm/dd/yyyy format)
        const date = rawDate ? rawDate : null;
        
        const disease = get('Disease') || get('disease') || get('disease_type') || 'Unknown Disease';
        const cases = Number(get('Cases') ?? get('cases') ?? get('case_count') ?? 0) || 0;
        const barangay = get('Barangay') || get('barangay') || get('location') || 'Unknown';
        const ageGroup = get('Age_Group') || get('age_group') || 'All';
        const gender = get('Gender') || get('gender') || 'All';
        const severity = get('Severity') || get('severity') || 'Unknown';
        const source = get('Source') || get('source') || 'PIDSR';

        return {
            id,
            type: 'Health',
            category: disease,
            value: cases,
            date,
            location: {
                city: 'Zamboanga',
                barangay: barangay || 'Citywide'
            },
            source,
            metadata: { importedFrom: 'disease_100.csv', ageGroup, gender, severity }
        };
    }

    // Backwards-compatible alias (some code may call createHealthRecordFromDiseaseCSV)
    createHealthRecordFromDiseaseCSV(csvRecord) {
        return this.createDiseaseRecord(csvRecord);
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
                // Handle mm/dd/yyyy format from disease_100.csv
                const [month, day, year] = r.date.split('/');
                const recordDate = new Date(year, month - 1, day);
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