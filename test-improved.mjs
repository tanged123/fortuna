import fs from 'fs';

// Read the actual CSV file
const csvContent = fs.readFileSync('🦀MONEY MONEY MONEY🦀 - Income and Investing.csv', 'utf8');

console.log('Testing improved CSV parsing with Papa Parse...\n');

// Use Papa Parse to properly handle quoted CSV
import Papa from 'papaparse';

const results = Papa.parse(csvContent, {
  header: false,
  skipEmptyLines: true,
  transform: (value) => value?.trim() || '',
  quotes: true,
  quoteChar: '"',
  escapeChar: '"'
});

const data = results.data;

console.log('Parsed data:');
data.forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

console.log('\n' + '='.repeat(50) + '\n');

// Now extract financial data
let monthlyIncome = 0;
const expenses = [];
const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Resturants', 'Gas/Auto', 'Medical/Health', 'Gym', 'Travel', 'Shopping', 'Fun / Night out', 'Misc.'];

// Find monthly income
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (row[0] && row[0].includes('Monthly Net Income')) {
    // Look at next row for the amount
    if (i + 1 < data.length) {
      const nextRow = data[i + 1];
      const amountStr = nextRow[0] || '';
      const match = amountStr.match(/\$?\s*[\d,]+\.?\d*/);
      if (match) {
        monthlyIncome = parseFloat(match[0].replace(/[$,]/g, ''));
        break;
      }
    }
  }
}

// Find expenses
for (const row of data) {
  const category = row[0]?.trim();
  if (category && expenseCategories.includes(category)) {
    // Amount is in the second column
    const amountStr = row[1] || '';
    const match = amountStr.match(/\$?\s*[\d,]+\.?\d*/);
    if (match) {
      const amount = parseFloat(match[0].replace(/[$,]/g, ''));
      if (amount > 0) {
        expenses.push({ category, amount });
      }
    }
  }
}

// Find annual return
let annualReturn = 7;
for (const row of data) {
  if (row[0] && row[0].includes('Annual Return')) {
    const amountStr = row[1] || '';
    const match = amountStr.match(/\d+/);
    if (match) {
      annualReturn = parseFloat(match[0]);
      break;
    }
  }
}

const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
const savings = monthlyIncome - totalExpenses;
const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

console.log('Financial Data Extraction Results:');
console.log('==================================');
console.log(`Monthly Income: $${monthlyIncome.toFixed(2)}`);
console.log(`Total Expenses: $${totalExpenses.toFixed(2)}`);
console.log(`Savings: $${savings.toFixed(2)}`);
console.log(`Savings Percentage: ${savingsPercentage.toFixed(2)}%`);
console.log(`Annual Return: ${annualReturn}%`);

console.log('\nExpenses:');
expenses.forEach(exp => {
  console.log(`  ${exp.category}: $${exp.amount.toFixed(2)}`);
});