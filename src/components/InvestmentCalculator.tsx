import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Target } from 'lucide-react';
import { ParsedFinancialData } from '../types/finance';
import { formatCurrency, calculateInvestmentProjection } from '../utils/csvParser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InvestmentCalculatorProps {
  data: ParsedFinancialData;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ data }) => {
  const [monthlyContribution, setMonthlyContribution] = useState(data.savings);
  const [annualReturn, setAnnualReturn] = useState(data.annualReturn);
  const [years, setYears] = useState(30);
  const [projectionData, setProjectionData] = useState<any[]>([]);

  useEffect(() => {
    // Generate projection data for the chart
    const data = [];
    for (let year = 1; year <= years; year++) {
      const projectedValue = calculateInvestmentProjection(monthlyContribution, annualReturn, year);
      data.push({
        year,
        value: projectedValue,
        contributions: monthlyContribution * 12 * year,
        gains: projectedValue - (monthlyContribution * 12 * year)
      });
    }
    setProjectionData(data);
  }, [monthlyContribution, annualReturn, years]);

  const finalValue = calculateInvestmentProjection(monthlyContribution, annualReturn, years);
  const totalContributions = monthlyContribution * 12 * years;
  const totalGains = finalValue - totalContributions;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">Year {label}</p>
          <p className="text-primary-600">
            Total Value: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-success-600">
            Contributions: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-warning-600">
            Gains: {formatCurrency(payload[2].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Investment Calculator</h2>
      
      {/* Input Controls */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Investment Parameters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="input-field"
              min="0"
              step="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Based on your current savings: {formatCurrency(data.savings)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Return Rate (%)
            </label>
            <input
              type="number"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="input-field"
              min="0"
              max="20"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Historical S&P 500 average: ~10%
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Period (Years)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="input-field"
              min="1"
              max="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time horizon for your investments
            </p>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-primary-500 bg-primary-50">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Final Value</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(finalValue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-success-500 bg-success-50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-success-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(totalContributions)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-warning-500 bg-warning-50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Investment Gains</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatCurrency(totalGains)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Growth Projection</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Total Value"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="contributions" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Contributions"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="gains" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Investment Gains"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Return on Investment:</span>
              <span className="font-semibold text-primary-600">
                {((totalGains / totalContributions) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gains vs Contributions:</span>
              <span className="font-semibold text-warning-600">
                {((totalGains / totalContributions) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average Growth:</span>
              <span className="font-semibold text-success-600">
                {formatCurrency(finalValue / (years * 12))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compound Growth Factor:</span>
              <span className="font-semibold text-primary-600">
                {(finalValue / totalContributions).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;