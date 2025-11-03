export default class ClimateDataService {
    constructor() {
        this.climateData = [];
    }

    async loadClimateData(data) {
        this.climateData = data.map((record, index) => ({
            id: index + 1,
            type: 'Climate',
            location: {
                city: 'Davao City',
                barangay: record.barangay || 'Unknown'
            },
            date: record.date,
            time: record.time,
            temperature: parseFloat(record.temperature),
            humidity: parseFloat(record.humidity),
            soil_moisture: parseFloat(record.soil_moisture),
            soil_temperature: parseFloat(record.soil_temperature),
            rainfall: parseFloat(record.rainfall)
        }));
    }

    getClimateData() {
        return this.climateData;
    }

    getFilteredData(filters) {
        return this.climateData.filter(record => {
            if (filters.location !== 'all' && record.location.barangay !== filters.location) return false;
            if (filters.startDate && new Date(record.date) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(record.date) > new Date(filters.endDate)) return false;
            return true;
        });
    }

    getAggregatedData(timeframe = 'daily') {
        const aggregated = {};
        
        this.climateData.forEach(record => {
            const date = new Date(record.date);
            let key;
            
            switch(timeframe) {
                case 'daily':
                    key = record.date;
                    break;
                case 'weekly':
                    const weekNumber = Math.ceil((date.getDate()) / 7);
                    key = `Week ${weekNumber}, ${date.getFullYear()}`;
                    break;
                case 'monthly':
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
                default:
                    key = record.date;
            }

            if (!aggregated[key]) {
                aggregated[key] = {
                    temperature: [],
                    humidity: [],
                    soil_moisture: [],
                    soil_temperature: [],
                    rainfall: []
                };
            }

            aggregated[key].temperature.push(record.temperature);
            aggregated[key].humidity.push(record.humidity);
            aggregated[key].soil_moisture.push(record.soil_moisture);
            aggregated[key].soil_temperature.push(record.soil_temperature);
            aggregated[key].rainfall.push(record.rainfall);
        });

        // Calculate averages
        return Object.entries(aggregated).map(([date, values]) => ({
            date,
            temperature: this.calculateAverage(values.temperature),
            humidity: this.calculateAverage(values.humidity),
            soil_moisture: this.calculateAverage(values.soil_moisture),
            soil_temperature: this.calculateAverage(values.soil_temperature),
            rainfall: this.calculateSum(values.rainfall) // Sum for rainfall
        }));
    }

    calculateAverage(values) {
        return values.length > 0 
            ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
            : 0;
    }

    calculateSum(values) {
        return values.length > 0
            ? values.reduce((a, b) => a + b, 0).toFixed(2)
            : 0;
    }
}