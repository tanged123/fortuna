import React, { useState } from 'react';
import { Wallet, TrendingUp, BarChart3, Calculator, GitBranch } from 'lucide-react';
import CSVUploader from './components/CSVUploader';
import FinancialOverview from './components/FinancialOverview';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import InvestmentCalculator from './components/InvestmentCalculator';
import SankeyChart from './components/SankeyChart';
import { ParsedFinancialData } from './types/finance';
import { ParseResult } from './utils/csvParser';

type TabType = 'overview' | 'expenses' | 'investments' | 'flow';

const App: React.FC = () => {
  const [financialData, setFinancialData] = useState<ParsedFinancialData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleDataParsed = (result: ParseResult) => {
    setFinancialData(result.data);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Wallet },
    { id: 'expenses' as TabType, label: 'Expenses', icon: BarChart3 },
    { id: 'flow' as TabType, label: 'Money Flow', icon: GitBranch },
    { id: 'investments' as TabType, label: 'Investments', icon: Calculator }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fortuna</h1>
                <p className="text-sm text-gray-500">Financial Manager</p>
              </div>
            </div>
            
            {financialData && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Monthly Net Income</p>
                <p className="text-lg font-semibold text-primary-600">
                  ${financialData.monthlyNetIncome.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!financialData ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Fortuna
              </h2>
              <p className="text-lg text-gray-600">
                Your modern financial management companion. Upload your financial data to get started with comprehensive insights and projections.
              </p>
            </div>
            <CSVUploader onDataParsed={handleDataParsed} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <FinancialOverview data={financialData} />
              )}
              
              {activeTab === 'expenses' && (
                <ExpenseBreakdown data={financialData} />
              )}
              
              {activeTab === 'flow' && (
                <SankeyChart data={financialData} />
              )}
              
              {activeTab === 'investments' && (
                <InvestmentCalculator data={financialData} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Built with React, TypeScript, and Tailwind CSS • 
              <span className="mx-2">📊</span>
              Powered by Recharts for beautiful visualizations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;