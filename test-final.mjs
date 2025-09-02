import fs from 'fs';
import Papa from 'papaparse';

// Read the actual CSV file
const csvContent = fs.readFileSync('🦀MONEY MONEY MONEY🦀 - Income and Investing.csv', 'utf8');

console.log('Testing final CSV parser implementation...\n');

// Simulate the CSVStandardizer logic
function standardizeCSV(csvContent) {
  const results = Papa.parse(csvContent, {
    header: false,
    skipEmptyLines: true,
    transform: (value) => value?.trim() || '',
    quotes: true,
    quoteChar: '"',
    escapeChar: '"'
  });

  const data = results.data;
  
  if (data.length === 0) {
    return { headers: [], rows: [], rawData: [] };
  }

  // First row is headers
  const headers = data[0].map(h => h.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_').trim());
  
  // Extract data rows
  const dataRows = data.slice(1);
  const rows = dataRows.map(row => {
    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] || '';
    });
    return rowObj;
  });

  return {
    headers,
    rows,
    rawData: data
  };
}

function extractFinancialData(standardizedData) {
  const { headers, rows } = standardizedData;
  
  // Find income data
  const monthlyNetIncome = extractIncome(rows, headers);
  
  // Find expense data
  const expenses = extractExpenses(rows, headers);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate savings
  const savings = monthlyNetIncome - totalExpenses;
  const savingsPercentage = monthlyNetIncome > 0 ? (savings / monthlyNetIncome) * 100 : 0;
  
  // Find annual return
  const annualReturn = extractAnnualReturn(rows, headers);
  
  return {
    monthlyNetIncome,
    expenses,
    totalExpenses,
    savings,
    savingsPercentage,
    annualReturn
  };
}

function extractIncome(rows, headers) {
  const incomePatterns = [
    /income/i, /salary/i, /wage/i, /earnings/i, /revenue/i,
    /net income/i, /monthly income/i, /annual income/i, /gross income/i, /take home/i
  ];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const [key, value] of Object.entries(row)) {
      if (incomePatterns.some(pattern => pattern.test(value))) {
        // Look for amount in the same row first
        const amount = findAmountInRow(row, headers);
        if (amount > 0) return amount;
        
        // Check next row if current row doesn't have amount
        if (i + 1 < rows.length) {
          const nextRow = rows[i + 1];
          const nextAmount = findAmountInRow(nextRow, headers);
          if (nextAmount > 0) return nextAmount;
        }
      }
    }
  }
  
  return 0;
}

function extractExpenses(rows, headers) {
  const expenses = [];
  const expensePatterns = [
    /expense/i, /cost/i, /spending/i, /payment/i, /bill/i,
    /rent/i, /utilities/i, /groceries/i, /food/i, /restaurant/i,
    /gas/i, /auto/i, /car/i, /medical/i, /health/i, /gym/i,
    /travel/i, /shopping/i, /entertainment/i, /fun/i, /misc/i, /miscellaneous/i
  ];
  
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (value && expensePatterns.some(pattern => pattern.test(value))) {
        const amount = findAmountInRow(row, headers);
        if (amount > 0) {
          expenses.push({ category: value.trim(), amount });
        }
      }
    }
  }
  
  return expenses;
}

function extractAnnualReturn(rows, headers) {
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (/annual.*return|return.*annual/i.test(value)) {
        const amount = findAmountInRow(row, headers);
        if (amount > 0) return amount;
      }
    }
  }
  
  return 7; // Default 7% return
}

function findAmountInRow(row, headers) {
  const amountPatterns = [
    /^\s*\$?\s*[\d,]+\.?\d*\s*$/,
    /^\s*[\d,]+\.?\d*\s*%?\s*$/,
    /^\s*\$?\s*[\d,]+\.?\d*\s*%?\s*$/
  ];
  
  for (const [key, value] of Object.entries(row)) {
    if (value && amountPatterns.some(p => p.test(value))) {
      const cleaned = value.replace(/[$,%\s]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  // Also check for amounts that might be in the same cell as text
  for (const [key, value] of Object.entries(row)) {
    if (value) {
      // Look for dollar amounts in the text
      const dollarMatch = value.match(/\$\s*[\d,]+\.?\d*/);
      if (dollarMatch) {
        const cleaned = dollarMatch[0].replace(/[$,%\s]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
  }
  
  return 0;
}

// Test the implementation
const standardizedData = standardizeCSV(csvContent);
console.log('Standardized data headers:', standardizedData.headers);
console.log('Number of rows:', standardizedData.rows.length);

const financialData = extractFinancialData(standardizedData);

console.log('\nFinal Results:');
console.log('==============');
console.log(`Monthly Income: $${financialData.monthlyNetIncome.toFixed(2)}`);
console.log(`Total Expenses: $${financialData.totalExpenses.toFixed(2)}`);
console.log(`Savings: $${financialData.savings.toFixed(2)}`);
console.log(`Savings Percentage: ${financialData.savingsPercentage.toFixed(2)}%`);
console.log(`Annual Return: ${financialData.annualReturn}%`);

console.log('\nExpenses:');
financialData.expenses.forEach(exp => {
  console.log(`  ${exp.category}: $${exp.amount.toFixed(2)}`);
});