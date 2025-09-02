# Fortuna - Financial Manager

A modern, responsive web application for managing your personal finances with beautiful visualizations and investment projections.

## Features

- 📊 **CSV Import**: Upload your financial data from CSV files
- 💰 **Financial Overview**: Comprehensive dashboard with income, expenses, and savings analysis
- 📈 **Expense Breakdown**: Interactive charts showing expense distribution and trends
- 🚀 **Investment Calculator**: Project future wealth with customizable parameters
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for beautiful data visualizations
- **CSV Parsing**: PapaParse for robust CSV file handling
- **Icons**: Lucide React for consistent iconography

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage

### 1. Upload Your Financial Data

- Click "Choose File" to upload your CSV file
- The app supports CSV files with income and expense data
- Your data is parsed and analyzed automatically

### 2. Explore Your Financial Overview

- View your monthly income, expenses, and savings at a glance
- Get insights into your savings rate with visual indicators
- See recommendations based on your financial health

### 3. Analyze Your Expenses

- Interactive pie and bar charts show expense distribution
- Detailed table with percentages and progress bars
- Identify your biggest expense categories

### 4. Plan Your Investments

- Use the investment calculator to project future wealth
- Adjust monthly contributions, return rates, and time horizons
- Visualize compound growth with interactive charts

## CSV Format Support

The app can parse CSV files with the following structure:
- Date column
- Income columns (various formats)
- Expense categories with amounts
- Currency values in $ format

Example supported formats:
```csv
date,income,expense1,expense2
01/01/2024,"$5,000","$1,200","$300"
```

## Customization

### Styling
- Modify `tailwind.config.js` to customize colors and themes
- Update `src/index.css` for global styles
- Component-specific styles use Tailwind utility classes

### Data Processing
- Extend `src/utils/csvParser.ts` to support additional CSV formats
- Modify `src/types/finance.ts` to add new data structures

### Components
- All components are modular and can be easily customized
- Add new features by creating components in `src/components/`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for better financial management**# fortuna
# fortuna
# fortuna
