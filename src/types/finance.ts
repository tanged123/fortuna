export interface FinancialData {
  date: string;
  income: number;
  expenses: Expense[];
  totalExpenses: number;
  netIncome: number;
  savings: number;
  savingsPercentage: number;
}

export interface Expense {
  category: string;
  amount: number;
  description?: string;
}

export interface InvestmentProjection {
  annualReturn: number;
  monthlyContribution: number;
  years: number;
  projectedValue: number;
}

export interface CSVRow {
  date: string;
  'booba money': string;
  'booboo moeny': string;
  'baobooboo money': string;
}

export interface ParsedFinancialData {
  monthlyNetIncome: number;
  expenses: Expense[];
  totalExpenses: number;
  savings: number;
  savingsPercentage: number;
  annualReturn: number;
}