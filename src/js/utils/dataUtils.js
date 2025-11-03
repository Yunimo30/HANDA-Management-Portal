// Function to parse CSV data
export const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            // Try to convert to number if possible
            const value = values[index];
            obj[header] = isNaN(value) ? value : Number(value);
            return obj;
        }, {});
    });
};

// Function to fetch and parse CSV files
export const loadCSVData = async (filename) => {
    try {
        const response = await fetch(`/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
};

// Utility functions for data processing
export const groupByMonth = (data, dateField) => {
    const groupedData = {};
    
    data.forEach(item => {
        const date = new Date(item[dateField]);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groupedData[monthYear]) {
            groupedData[monthYear] = [];
        }
        groupedData[monthYear].push(item);
    });
    
    return groupedData;
};

export const calculateMonthlyAverages = (data, valueField) => {
    const monthlyData = {};
    
    Object.entries(data).forEach(([month, entries]) => {
        monthlyData[month] = entries.reduce((sum, entry) => sum + entry[valueField], 0) / entries.length;
    });
    
    return monthlyData;
};

export const getLastNMonths = (n) => {
    const months = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthYear);
    }
    
    return months;
};