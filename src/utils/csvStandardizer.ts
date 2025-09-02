import Papa from 'papaparse';
import { ParsedFinancialData, Expense } from '../types/finance';

export interface StandardizedCSVData {
  headers: string[];
  rows: Record<string, string>[];
  rawData: any[];
}

export interface FinancialDataPattern {
  incomePatterns: RegExp[];
  expensePatterns: RegExp[];
  amountPatterns: RegExp[];
  datePatterns: RegExp[];
}

export class CSVStandardizer {
  private static readonly FINANCIAL_PATTERNS: FinancialDataPattern = {
    incomePatterns: [
      /income/i,
      /salary/i,
      /wage/i,
      /earnings/i,
      /revenue/i,
      /net income/i,
      /monthly income/i,
      /annual income/i,
      /gross income/i,
      /take home/i
    ],
    expensePatterns: [
      /expense/i,
      /cost/i,
      /spending/i,
      /payment/i,
      /bill/i,
      /rent/i,
      /utilities/i,
      /groceries/i,
      /food/i,
      /restaurant/i,
      /resturant/i, // Handle common misspelling
      /gas/i,
      /auto/i,
      /car/i,
      /medical/i,
      /health/i,
      /gym/i,
      /travel/i,
      /shopping/i,
      /entertainment/i,
      /fun/i,
      /misc/i,
      /miscellaneous/i
    ],
    amountPatterns: [
      /^\s*\$?\s*[\d,]+\.?\d*\s*$/,
      /^\s*[\d,]+\.?\d*\s*%?\s*$/,
      /^\s*\$?\s*[\d,]+\.?\d*\s*%?\s*$/
    ],
    datePatterns: [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^\d{1,2}-\d{1,2}-\d{2,4}$/
    ]
  };

  // Common misspellings and variations for expense categories
  private static readonly EXPENSE_VARIATIONS: Record<string, string[]> = {
    'restaurant': ['resturant', 'restraunt', 'resturants', 'restaurants'],
    'utilities': ['utility', 'utilities'],
    'groceries': ['grocery', 'groceries', 'grocery store'],
    'medical': ['medical', 'health', 'healthcare', 'medical/health'],
    'gas': ['gas', 'fuel', 'gas/auto', 'auto', 'car'],
    'entertainment': ['entertainment', 'fun', 'night out', 'fun / night out'],
    'miscellaneous': ['misc', 'miscellaneous', 'misc.', 'other', 'others']
  };

  /**
   * Standardizes CSV data by detecting headers and normalizing the structure
   */
  static standardizeCSV(csvContent: string): StandardizedCSVData {
    const results = Papa.parse<string[]>(csvContent, {
      header: false,
      skipEmptyLines: true,
      transform: (value: string) => value?.trim() || '',
      // Handle quoted values properly
      quoteChar: '"',
      escapeChar: '"'
    });

    const data = results.data;
    
    if (data.length === 0) {
      return { headers: [], rows: [], rawData: [] };
    }

    // Detect header row (usually first non-empty row)
    const headerRow = this.detectHeaderRow(data);
    const headers = this.normalizeHeaders(data[headerRow] || []);
    
    // Extract data rows
    const dataRows = data.slice(headerRow + 1);
    const rows = dataRows.map(row => {
      const rowObj: Record<string, string> = {};
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

  /**
   * Detects which row contains the headers
   */
  private static detectHeaderRow(data: string[][]): number {
    // For most CSVs, the first row is the header
    // But we can also look for patterns that suggest header rows
    let bestHeaderRow = 0;
    let maxTextScore = 0;

    for (let i = 0; i < Math.min(3, data.length); i++) {
      const row = data[i];
      let textScore = 0;
      
      for (const cell of row) {
        if (cell && typeof cell === 'string') {
          // Score based on text characteristics
          if (this.FINANCIAL_PATTERNS.incomePatterns.some(p => p.test(cell))) textScore += 3;
          if (this.FINANCIAL_PATTERNS.expensePatterns.some(p => p.test(cell))) textScore += 2;
          if (!this.FINANCIAL_PATTERNS.amountPatterns.some(p => p.test(cell))) textScore += 1;
          if (cell.length > 3 && !/^\d+$/.test(cell)) textScore += 1;
          // Bonus for common header words
          if (/date|category|amount|description|type/i.test(cell)) textScore += 2;
        }
      }
      
      if (textScore > maxTextScore) {
        maxTextScore = textScore;
        bestHeaderRow = i;
      }
    }

    return bestHeaderRow;
  }

  /**
   * Normalizes headers to standard format
   */
  private static normalizeHeaders(headers: string[]): string[] {
    return headers.map((header, index) => {
      if (!header || header.trim() === '') {
        return `column_${index + 1}`;
      }
      
      // Clean and normalize header
      let normalized = header.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      // Map common variations to standard names
      const headerMappings: Record<string, string> = {
        'booba_money': 'category',
        'booboo_moeny': 'amount',
        'baobooboo_money': 'running_total',
        'date': 'date',
        'description': 'description',
        'category': 'category',
        'amount': 'amount',
        'value': 'amount',
        'cost': 'amount',
        'price': 'amount'
      };
      
      return headerMappings[normalized] || normalized;
    });
  }

  /**
   * Extracts financial data from standardized CSV
   */
  static extractFinancialData(standardizedData: StandardizedCSVData): ParsedFinancialData {
    const { headers, rows } = standardizedData;
    
    // Find income data
    const monthlyNetIncome = this.extractIncome(rows, headers);
    
    // Find expense data
    const expenses = this.extractExpenses(rows, headers);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate savings
    const savings = monthlyNetIncome - totalExpenses;
    const savingsPercentage = monthlyNetIncome > 0 ? (savings / monthlyNetIncome) * 100 : 0;
    
    // Find annual return
    const annualReturn = this.extractAnnualReturn(rows, headers);
    
    return {
      monthlyNetIncome,
      expenses,
      totalExpenses,
      savings,
      savingsPercentage,
      annualReturn
    };
  }

  /**
   * Extracts income information from CSV rows
   */
  private static extractIncome(rows: Record<string, string>[], headers: string[]): number {
    // Look for income-related rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (const [, value] of Object.entries(row)) {
        if (this.FINANCIAL_PATTERNS.incomePatterns.some(pattern => pattern.test(value))) {
          // Look for amount in the same row first
          const amount = this.findAmountInRow(row, headers);
          if (amount > 0) return amount;
          
          // Check next row if current row doesn't have amount
          if (i + 1 < rows.length) {
            const nextRow = rows[i + 1];
            const nextAmount = this.findAmountInRow(nextRow, headers);
            if (nextAmount > 0) return nextAmount;
          }
        }
      }
    }
    
    return 0;
  }

  /**
   * Extracts expense information from CSV rows
   */
  private static extractExpenses(rows: Record<string, string>[], headers: string[]): Expense[] {
    const expenses: Expense[] = [];
    
    for (const row of rows) {
      // Look for expense categories in any column
      for (const [, value] of Object.entries(row)) {
        if (value && this.isExpenseCategory(value)) {
          // Found an expense category, look for amount in the same row
          const amount = this.findAmountInRow(row, headers);
          if (amount > 0) {
            const normalizedCategory = this.normalizeExpenseCategory(value.trim());
            expenses.push({ category: normalizedCategory, amount });
          }
        }
      }
    }
    
    return expenses;
  }

  /**
   * Extracts annual return percentage
   */
  private static extractAnnualReturn(rows: Record<string, string>[], headers: string[]): number {
    for (const row of rows) {
      for (const [, value] of Object.entries(row)) {
        if (/annual.*return|return.*annual/i.test(value)) {
          const amount = this.findAmountInRow(row, headers);
          if (amount > 0) return amount;
        }
      }
    }
    
    return 7; // Default 7% return
  }

  /**
   * Finds category/description in a row
   */
  private static findCategoryInRow(row: Record<string, string>, headers: string[]): string | null {
    for (const [, value] of Object.entries(row)) {
      if (value && 
          !this.FINANCIAL_PATTERNS.amountPatterns.some(p => p.test(value)) &&
          !this.FINANCIAL_PATTERNS.datePatterns.some(p => p.test(value)) &&
          value.length > 1) {
        return value.trim();
      }
    }
    return null;
  }

  /**
   * Finds amount in a row
   */
  private static findAmountInRow(row: Record<string, string>, headers: string[]): number {
    for (const [, value] of Object.entries(row)) {
      if (value && this.FINANCIAL_PATTERNS.amountPatterns.some(p => p.test(value))) {
        const cleaned = value.replace(/[$,%\s]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    
    // Also check for amounts that might be in the same cell as text
    for (const [, value] of Object.entries(row)) {
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

  /**
   * Checks if a category is an expense category
   */
  private static isExpenseCategory(category: string): boolean {
    return this.FINANCIAL_PATTERNS.expensePatterns.some(pattern => pattern.test(category));
  }

  /**
   * Normalizes expense category names to handle misspellings and variations
   */
  private static normalizeExpenseCategory(category: string): string {
    const normalized = category.toLowerCase().trim();
    
    // Check against known variations
    for (const [standardName, variations] of Object.entries(this.EXPENSE_VARIATIONS)) {
      if (variations.some(variation => variation.toLowerCase() === normalized)) {
        return standardName;
      }
    }
    
    // Try fuzzy matching for close misspellings
    const fuzzyMatch = this.findFuzzyMatch(normalized);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }
    
    // If no variation found, return the original category
    return category;
  }

  /**
   * Finds fuzzy matches for expense categories using simple string similarity
   */
  private static findFuzzyMatch(category: string): string | null {
    const standardCategories = Object.keys(this.EXPENSE_VARIATIONS);
    
    for (const standard of standardCategories) {
      if (this.calculateSimilarity(category, standard) > 0.8) {
        return standard;
      }
    }
    
    return null;
  }

  /**
   * Calculates string similarity using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Validates and cleans CSV content
   */
  static validateAndCleanCSV(csvContent: string): { isValid: boolean; cleanedContent: string; errors: string[] } {
    const errors: string[] = [];
    let cleanedContent = csvContent;

    try {
      // Basic validation
      if (!csvContent || csvContent.trim().length === 0) {
        errors.push('CSV content is empty');
        return { isValid: false, cleanedContent: '', errors };
      }

      // Try to parse and re-serialize to clean up formatting
      const results = Papa.parse<string[]>(csvContent, {
        header: false,
        skipEmptyLines: true,
        transform: (value: string) => value?.trim() || ''
      });

      if (results.errors.length > 0) {
        errors.push(...results.errors.map(e => e.message));
      }

      // Re-serialize to ensure consistent formatting
      cleanedContent = Papa.unparse(results.data);

      return {
        isValid: errors.length === 0,
        cleanedContent,
        errors
      };
    } catch (error) {
      errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, cleanedContent: '', errors };
    }
  }
}