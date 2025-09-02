import { ParsedFinancialData } from '../types/finance';
import { CSVStandardizer } from './csvStandardizer';

export interface ParseResult {
  data: ParsedFinancialData;
  errors: string[];
  warnings: string[];
}

export const parseCSV = (csvContent: string): ParseResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate and clean the CSV content
    const validation = CSVStandardizer.validateAndCleanCSV(csvContent);
    if (!validation.isValid) {
      errors.push(...validation.errors);
      return {
        data: getDefaultFinancialData(),
        errors,
        warnings
      };
    }

    // Standardize the CSV data
    const standardizedData = CSVStandardizer.standardizeCSV(validation.cleanedContent);
    
    if (standardizedData.rows.length === 0) {
      errors.push('No data rows found in CSV');
      return {
        data: getDefaultFinancialData(),
        errors,
        warnings
      };
    }

    // Extract financial data using the standardizer
    const financialData = CSVStandardizer.extractFinancialData(standardizedData);

    // Add warnings for missing data
    if (financialData.monthlyNetIncome === 0) {
      warnings.push('No monthly income found in CSV');
    }
    if (financialData.expenses.length === 0) {
      warnings.push('No expenses found in CSV');
    }
    if (financialData.annualReturn === 7) {
      warnings.push('Using default annual return of 7% (no return rate found in CSV)');
    }

    return {
      data: financialData,
      errors,
      warnings
    };

  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      data: getDefaultFinancialData(),
      errors,
      warnings
    };
  }
};

/**
 * Returns default financial data when parsing fails
 */
const getDefaultFinancialData = (): ParsedFinancialData => ({
  monthlyNetIncome: 0,
  expenses: [],
  totalExpenses: 0,
  savings: 0,
  savingsPercentage: 0,
  annualReturn: 7
});

/**
 * Legacy function for backward compatibility
 * @deprecated Use parseCSV instead for better error handling
 */
export const parseCSVLegacy = (csvContent: string): ParsedFinancialData => {
  const result = parseCSV(csvContent);
  return result.data;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateInvestmentProjection = (
  monthlyContribution: number,
  annualReturn: number,
  years: number
): number => {
  const monthlyRate = annualReturn / 100 / 12;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyContribution * totalMonths;
  }
  
  return monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
};