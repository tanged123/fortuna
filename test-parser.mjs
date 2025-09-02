import fs from 'fs';

// Simple test of the CSV standardizer logic
const csvContent = `date,booba money,booboo moeny,baobooboo money
09/01/25," $ 96,200.00 "," $ 62,400.00 "," $ 158,600.00 "
,,,
Monthly Net Income,,,
" $ 13,216.67 ",,,
Monthly Expenses,,,
Rent," $ 3,215.00 ",," $ 10,001.67 "
Utilities, $ 235.87 ,," $ 9,765.80 "
Groceries, $ 650.00 ,," $ 9,115.80 "
Resturants," $ 1,080.00 ",," $ 8,035.80 "
Gas/Auto, $ 150.00 ,," $ 7,885.80 "
Medical/Health, $ 390.00 ,," $ 7,495.80 "
Gym, $ 500.00 ,," $ 6,995.80 "
Travel," $ 1,000.00 ",," $ 5,995.80 "
Shopping," $ 1,000.00 ",," $ 4,995.80 "
Fun / Night out, $ 500.00 ,," $ 4,495.80 "
Misc., $ 500.00 ,," $ 3,995.80 "
Savings (cash),,," $ 3,995.80 "
TOTAL," $ 9,220.87 ",,
Savings (percentage),0.3023301387,,
,,,
Projected Investments,,,
Annual Return,7%,,`;

// Test the parsing logic
function testParsing() {
  console.log('Testing CSV parsing logic...\n');
  
  // Split into lines and parse
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  console.log('Headers:', headers);
  
  // Find income
  let monthlyIncome = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Monthly Net Income')) {
      // Look at next line for the amount
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const match = nextLine.match(/\$?\s*[\d,]+\.?\d*/);
        if (match) {
          monthlyIncome = parseFloat(match[0].replace(/[$,]/g, ''));
          break;
        }
      }
    }
  }
  
  console.log('Monthly Income:', monthlyIncome);
  
  // Find expenses
  const expenses = [];
  const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Resturants', 'Gas/Auto', 'Medical/Health', 'Gym', 'Travel', 'Shopping', 'Fun / Night out', 'Misc.'];
  
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const category = parts[1]?.trim();
      const amountStr = parts[1]?.trim();
      
      if (category && expenseCategories.includes(category)) {
        // Amount is in the same cell as category, need to extract it
        const amountMatch = amountStr.match(/\$?\s*[\d,]+\.?\d*/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[0].replace(/[$,]/g, ''));
          if (amount > 0) {
            expenses.push({ category, amount });
          }
        }
      }
    }
  }
  
  console.log('Expenses:', expenses);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const savings = monthlyIncome - totalExpenses;
  const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  
  console.log('Total Expenses:', totalExpenses);
  console.log('Savings:', savings);
  console.log('Savings Percentage:', savingsPercentage.toFixed(2) + '%');
}

testParsing();