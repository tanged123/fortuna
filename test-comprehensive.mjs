import fs from 'fs';

// Read the actual CSV file
const csvContent = fs.readFileSync('🦀MONEY MONEY MONEY🦀 - Income and Investing.csv', 'utf8');

console.log('Testing comprehensive CSV parsing...\n');

// Parse CSV manually to understand the structure
const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
const headers = lines[0].split(',').map(h => h.trim());

console.log('Headers:', headers);
console.log('Number of lines:', lines.length);

// Parse each line
const data = [];
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  data.push(row);
}

console.log('\nFirst few rows:');
data.slice(0, 10).forEach((row, i) => {
  console.log(`Row ${i + 1}:`, row);
});

// Find monthly income
let monthlyIncome = 0;
for (const row of data) {
  if (row['booba money'] && row['booba money'].includes('Monthly Net Income')) {
    // Look for amount in the same row or next row
    const currentIndex = data.indexOf(row);
    if (currentIndex + 1 < data.length) {
      const nextRow = data[currentIndex + 1];
      const amountStr = nextRow['booba money'] || '';
      const match = amountStr.match(/\$?\s*[\d,]+\.?\d*/);
      if (match) {
        monthlyIncome = parseFloat(match[0].replace(/[$,]/g, ''));
        break;
      }
    }
  }
}

console.log('\nMonthly Income:', monthlyIncome);

// Find expenses
const expenses = [];
const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Resturants', 'Gas/Auto', 'Medical/Health', 'Gym', 'Travel', 'Shopping', 'Fun / Night out', 'Misc.'];

for (const row of data) {
  const category = row['booba money']?.trim();
  if (category && expenseCategories.includes(category)) {
    // Amount is in the 'booboo moeny' column
    const amountStr = row['booboo moeny'] || '';
    const match = amountStr.match(/\$?\s*[\d,]+\.?\d*/);
    if (match) {
      const amount = parseFloat(match[0].replace(/[$,]/g, ''));
      if (amount > 0) {
        expenses.push({ category, amount });
      }
    }
  }
}

console.log('\nExpenses found:');
expenses.forEach(exp => {
  console.log(`  ${exp.category}: $${exp.amount.toFixed(2)}`);
});

const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
const savings = monthlyIncome - totalExpenses;
const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

console.log('\nSummary:');
console.log(`Monthly Income: $${monthlyIncome.toFixed(2)}`);
console.log(`Total Expenses: $${totalExpenses.toFixed(2)}`);
console.log(`Savings: $${savings.toFixed(2)}`);
console.log(`Savings Percentage: ${savingsPercentage.toFixed(2)}%`);

// Find annual return
let annualReturn = 7;
for (const row of data) {
  if (row['booba money'] && row['booba money'].includes('Annual Return')) {
    const amountStr = row['booboo moeny'] || '';
    const match = amountStr.match(/\d+/);
    if (match) {
      annualReturn = parseFloat(match[0]);
      break;
    }
  }
}

console.log(`Annual Return: ${annualReturn}%`);