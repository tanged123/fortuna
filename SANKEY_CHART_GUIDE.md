# Sankey Chart Visualization Guide

## 🎯 Overview

I've created a beautiful, interactive Sankey chart that visualizes the flow of money from your monthly income to various expenses and savings. This provides an intuitive way to understand your financial data at a glance.

## ✨ Features

### **Visual Flow Representation**
- **Income Node**: Shows your monthly net income as the source
- **Expense Nodes**: Each expense category is represented as a separate node
- **Savings Node**: Shows how much you're saving each month
- **Flow Links**: Curved paths show the money flow with proportional thickness

### **Interactive Elements**
- **Hover Effects**: Nodes and links highlight when you hover over them
- **Tooltips**: Detailed information appears on hover
- **Smooth Animations**: Transitions and scaling effects for better UX
- **Responsive Design**: Works on different screen sizes

### **Smart Color Coding**
- **Income**: Green (#10B981) - represents money coming in
- **Savings**: Blue (#3B82F6) - represents money being saved
- **Expenses**: Category-specific colors for easy identification
  - Rent: Red (#EF4444)
  - Utilities: Orange (#F59E0B)
  - Groceries: Purple (#8B5CF6)
  - Restaurants: Pink (#EC4899)
  - Gas/Auto: Gray (#6B7280)
  - Medical: Orange (#F97316)
  - Gym: Lime (#84CC16)
  - Travel: Cyan (#06B6D4)
  - Shopping: Rose (#F43F5E)
  - Entertainment: Violet (#A855F7)
  - Miscellaneous: Slate (#64748B)

## 🎨 Design Features

### **Layout**
- **Left Side**: Income node (source)
- **Right Side**: Expense and savings nodes (destinations)
- **Curved Links**: Smooth Bézier curves connecting income to expenses
- **Proportional Sizing**: Node and link sizes reflect monetary amounts

### **Visual Enhancements**
- **Rounded Corners**: Modern, friendly appearance
- **Drop Shadows**: Subtle depth and dimension
- **Smooth Transitions**: 200ms animations for all interactions
- **Scale Effects**: Nodes slightly grow on hover
- **Opacity Changes**: Links become more prominent on hover

## 📊 Data Integration

### **Automatic Data Processing**
The chart automatically processes your financial data:

```typescript
// Input: ParsedFinancialData
{
  monthlyNetIncome: 13216.67,
  expenses: [
    { category: 'Rent', amount: 3215.00 },
    { category: 'Utilities', amount: 235.87 },
    // ... more expenses
  ],
  savings: 3995.80,
  savingsPercentage: 30.23
}
```

### **Smart Category Mapping**
- Handles misspelled categories (e.g., "Resturants" → "restaurant")
- Maps variations to standard names
- Uses fuzzy matching for unknown categories

## 🚀 Usage

### **Navigation**
1. Upload your CSV file
2. Click on the **"Money Flow"** tab
3. View your financial flow visualization

### **Interactions**
- **Hover over nodes**: See detailed information in tooltips
- **Hover over links**: Highlight specific money flows
- **View legend**: See all categories and amounts at a glance
- **Check summary**: Review key financial metrics below the chart

## 🎯 Benefits

### **Visual Understanding**
- **Instant Recognition**: See your biggest expenses immediately
- **Flow Visualization**: Understand how money moves through your budget
- **Proportional Representation**: Visual size reflects actual amounts
- **Color Association**: Easy to identify different expense types

### **Financial Insights**
- **Spending Patterns**: Quickly identify where most money goes
- **Savings Visualization**: See how much you're actually saving
- **Budget Analysis**: Compare different expense categories
- **Goal Setting**: Visual motivation for financial goals

## 🔧 Technical Implementation

### **Performance Optimizations**
- **useMemo**: Prevents unnecessary recalculations
- **Efficient Rendering**: Only re-renders when data changes
- **Smooth Animations**: CSS transitions for better performance
- **Responsive SVG**: Scales properly on different devices

### **Accessibility**
- **Color Contrast**: High contrast colors for readability
- **Hover States**: Clear visual feedback
- **Text Labels**: All amounts and categories are labeled
- **Keyboard Navigation**: Works with keyboard interactions

## 📱 Responsive Design

### **Mobile Optimization**
- **Horizontal Scrolling**: Chart scrolls on smaller screens
- **Touch Interactions**: Works with touch devices
- **Readable Text**: Appropriate font sizes for mobile
- **Compact Layout**: Efficient use of screen space

### **Desktop Experience**
- **Full Visualization**: Complete chart visible on larger screens
- **Hover Effects**: Rich interactions with mouse
- **Detailed Tooltips**: Comprehensive information display
- **Multi-column Layout**: Efficient use of screen real estate

## 🎨 Customization Options

### **Easy Color Changes**
```typescript
const colors = {
  income: '#10B981',    // Change income color
  savings: '#3B82F6',   // Change savings color
  // ... customize any category color
};
```

### **Layout Adjustments**
```typescript
const containerWidth = 900;   // Adjust chart width
const containerHeight = 500;  // Adjust chart height
const nodeWidth = 25;         // Adjust node thickness
```

## 🔮 Future Enhancements

1. **Time Series**: Show changes over multiple months
2. **Drill-down**: Click to see subcategories
3. **Comparison Mode**: Compare different time periods
4. **Export Options**: Save chart as image or PDF
5. **Animation**: Show data loading with smooth transitions
6. **Custom Categories**: Let users define their own categories
7. **Goal Tracking**: Visual progress toward financial goals

## 🎉 Result

The Sankey chart provides a beautiful, intuitive way to visualize your financial data flow. It transforms raw numbers into an engaging visual story that makes it easy to understand your spending patterns and savings goals at a glance!

**Try it out**: Upload your CSV file and click on the "Money Flow" tab to see your financial data come to life! 🚀