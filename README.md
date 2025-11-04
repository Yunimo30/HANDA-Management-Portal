# HANDA - Health and Climate Risk Management Portal

A modern web application for managing and visualizing health and climate risk data. Built with JavaScript and TailwindCSS, HANDA provides an intuitive interface for tracking health incidents and climate data while offering powerful visualization and reporting capabilities.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://yunimo30.github.io/HANDA-Management-Portal)
[![GitHub issues](https://img.shields.io/github/issues/Yunimo30/HANDA-Management-Portal)](https://github.com/Yunimo30/HANDA-Management-Portal/issues)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![HANDA Dashboard Preview](public/dashboard-preview.png)

## Features

### 🔐 User Management & Security
- Role-based access control (Admin/Staff)
- Secure user authentication
- User activation/deactivation
- Protected routes and API endpoints

### 📊 Data Visualization
- Interactive health trends analysis
  - Timeline view (line chart)
  - Category comparison (bar chart)
  - Distribution analysis (pie chart)
  - Multi-metric analysis (radar chart)
- Climate data visualization
- Geographic risk mapping

### 📋 Records Management
- Health incident tracking
- Climate data monitoring
- Location-based record organization
- Bulk data import/export

### 📈 Reporting & Analytics
- Customizable report generation
- Data filtering and aggregation
- Export functionality (CSV)
- Trend analysis and insights

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/Light mode support
- Smooth transitions and animations
- Intuitive navigation

## Tech Stack

- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Data Visualization**: Chart.js
- **Mapping**: Leaflet.js
- **State Management**: Custom implementation
- **Data Storage**: LocalStorage with service abstraction
- **Date Handling**: date-fns

## Project Structure

```
HANDA-Management-Portal/
├── src/
│   ├── js/
│   │   ├── models/      # Data models and types
│   │   ├── services/    # Business logic and data handling
│   │   ├── utils/       # Helper functions and utilities
│   │   └── views/       # UI components and view logic
│   └── css/            # Stylesheets and TailwindCSS config
├── public/            # Static assets and sample data
│   ├── climate_100.csv
│   └── disease_100.csv
├── index.html        # Entry point
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yunimo30/HANDA-Management-Portal.git
   cd HANDA-Management-Portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Default Credentials

- Admin Account:
  - Email: admin@city.gov
  - Password: admin

- Staff Account:
  - Email: staff@city.gov
  - Password: staff

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Project Link: [https://github.com/Yunimo30/HANDA-Management-Portal](https://github.com/Yunimo30/HANDA-Management-Portal)

## Development

The project uses a modular architecture with:
- Services for data and authentication
- View components for UI
- Models for data structure
- Modern animations and transitions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
