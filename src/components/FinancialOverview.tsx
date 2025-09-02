import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { ParsedFinancialData } from '../types/finance';
import { formatCurrency } from '../utils/csvParser';

interface FinancialOverviewProps {
  data: ParsedFinancialData;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ data }) => {
  const { monthlyNetIncome, totalExpenses, savings, savingsPercentage } = data;

  const overviewCards = [
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyNetIncome),
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200'
    },
    {
      title: 'Monthly Savings',
      value: formatCurrency(savings),
      icon: PiggyBank,
      color: savings >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: savings >= 0 ? 'bg-success-50' : 'bg-danger-50',
      borderColor: savings >= 0 ? 'border-success-200' : 'border-danger-200'
    },
    {
      title: 'Savings Rate',
      value: `${savingsPercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: savingsPercentage >= 20 ? 'text-success-600' : savingsPercentage >= 10 ? 'text-warning-600' : 'text-danger-600',
      bgColor: savingsPercentage >= 20 ? 'bg-success-50' : savingsPercentage >= 10 ? 'bg-warning-50' : 'bg-danger-50',
      borderColor: savingsPercentage >= 20 ? 'border-success-200' : savingsPercentage >= 10 ? 'border-warning-200' : 'border-danger-200'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`card border-l-4 ${card.borderColor} ${card.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <IconComponent className={`h-8 w-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Savings Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Savings Rate</span>
            <span className={`font-semibold ${
              savingsPercentage >= 20 ? 'text-success-600' : 
              savingsPercentage >= 10 ? 'text-warning-600' : 'text-danger-600'
            }`}>
              {savingsPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                savingsPercentage >= 20 ? 'bg-success-500' : 
                savingsPercentage >= 10 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {savingsPercentage >= 20 && "🎉 Excellent! You're saving more than 20% of your income."}
            {savingsPercentage >= 10 && savingsPercentage < 20 && "👍 Good! You're saving 10-20% of your income."}
            {savingsPercentage < 10 && savingsPercentage > 0 && "⚠️ Consider increasing your savings rate to at least 10%."}
            {savingsPercentage <= 0 && "🚨 You're spending more than you earn. Review your expenses."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;