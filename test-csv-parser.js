const fs = require('fs');
const path = require('path');

// Simple test script to verify the CSV parser works
async function testCSVParser() {
  try {
    // Read the problematic CSV file
    const csvPath = path.join(__dirname, '🦀MONEY MONEY MONEY🦀 - Income and Investing.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('CSV Content Preview:');
    console.log(csvContent.substring(0, 500) + '...\n');
    
    // Import and test the parser
    const { parseCSV } = require('./src/utils/csvParser.ts');
    
    console.log('Testing CSV Parser...\n');
    const result = parseCSV(csvContent);
    
    console.log('Parse Result:');
    console.log('============');
    console.log('Data:', JSON.stringify(result.data, null, 2));
    console.log('\nErrors:', result.errors);
    console.log('\nWarnings:', result.warnings);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCSVParser();