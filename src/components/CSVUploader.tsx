import React, { useState } from 'react';
import { parseCSV, ParseResult } from '../utils/csvParser';
import { formatCurrency } from '../utils/csvParser';

interface CSVUploaderProps {
  onDataParsed: (result: ParseResult) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataParsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const csvContent = await file.text();
      const result = parseCSV(csvContent);
      
      setLastResult(result);
      onDataParsed(result);
      
    } catch (error) {
      const errorResult: ParseResult = {
        data: {
          monthlyNetIncome: 0,
          expenses: [],
          totalExpenses: 0,
          savings: 0,
          savingsPercentage: 0,
          annualReturn: 7
        },
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
      
      setLastResult(errorResult);
      onDataParsed(errorResult);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Financial CSV File
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports various CSV formats with income, expenses, and financial data
        </p>
      </div>

      {isUploading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processing CSV...</span>
        </div>
      )}

      {lastResult && (
        <div className="space-y-3">
          {/* Errors */}
          {lastResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {lastResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {lastResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {lastResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Data Summary */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2">Parsed Data Summary:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Monthly Income: {formatCurrency(lastResult.data.monthlyNetIncome)}</div>
              <div>Total Expenses: {formatCurrency(lastResult.data.totalExpenses)}</div>
              <div>Savings: {formatCurrency(lastResult.data.savings)} ({lastResult.data.savingsPercentage.toFixed(1)}%)</div>
              <div>Expenses Found: {lastResult.data.expenses.length} categories</div>
              <div>Annual Return: {lastResult.data.annualReturn}%</div>
            </div>
          </div>

          {/* Expense Breakdown */}
          {lastResult.data.expenses.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Expense Breakdown:</h4>
              <div className="space-y-1">
                {lastResult.data.expenses.map((expense, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{expense.category}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;