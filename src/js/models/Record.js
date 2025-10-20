export class Record {
    constructor({
        id,
        type,
        location,
        date,
        category,
        value,
        source,
        notes
    }) {
        this.id = id;
        this.type = type;          // Health / Climate / Intervention
        this.location = location;   // { city, barangay }
        this.date = date;
        this.category = category;   // e.g., Rainfall, Temperature, Dengue Cases
        this.value = value;
        this.source = source;
        this.notes = notes;
        this.metadata = {
            createdAt: new Date(),
            modifiedAt: new Date()
        };
    }

    static validate(data) {
        const requiredFields = ['type', 'location', 'date', 'category', 'value'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!['Health', 'Climate', 'Intervention'].includes(data.type)) {
            throw new Error('Invalid record type');
        }

        if (!data.location.city || !data.location.barangay) {
            throw new Error('Invalid location data');
        }

        return true;
    }
}