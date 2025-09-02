import React, { useState, useMemo, useRef, useCallback } from 'react';
import { sankey, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';
import { scaleOrdinal } from 'd3-scale';
import { ParsedFinancialData } from '../types/finance';
import { formatCurrency } from '../utils/csvParser';

interface SankeyChartProps {
  data: ParsedFinancialData;
}

interface SankeyNode {
  name: string;
  category: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

const SankeyChart: React.FC<SankeyChartProps> = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate Sankey data from financial data
  const sankeyData = useMemo((): SankeyData => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // Add income node
    nodes.push({
      name: 'Monthly Income',
      category: 'income'
    });

    // Add expense nodes and links
    data.expenses.forEach((expense) => {
      const categoryKey = expense.category.toLowerCase().replace(/[^a-z]/g, '');
      
      nodes.push({
        name: expense.category,
        category: categoryKey
      });

      links.push({
        source: 'Monthly Income',
        target: expense.category,
        value: expense.amount
      });
    });

    // Add savings node and link
    if (data.savings > 0) {
      nodes.push({
        name: 'Savings',
        category: 'savings'
      });

      links.push({
        source: 'Monthly Income',
        target: 'Savings',
        value: data.savings
      });
    }

    return { nodes, links };
  }, [data]);

  // Chart dimensions
  const MARGIN_Y = 25;
  const MARGIN_X = 5;
  const containerWidth = 900;
  const containerHeight = 600;
  
  // Color scale
  const allGroups = Array.from(new Set(sankeyData.nodes.map((d) => d.category))).sort();
  const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6'
  ];
  const colorScale = scaleOrdinal<string>().domain(allGroups).range(COLORS);

  // Set up the sankey diagram properties
  const sankeyGenerator = sankey()
    .nodeWidth(26)
    .nodePadding(10)
    .extent([
      [MARGIN_X, MARGIN_Y],
      [containerWidth - MARGIN_X, containerHeight - MARGIN_Y],
    ])
    .nodeId((node: any) => node.name)
    .nodeAlign(sankeyJustify);

  // Compute nodes and links positions
  const { nodes, links } = sankeyGenerator(sankeyData as any);

  // Pan and zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Render nodes
  const allNodes = nodes.map((node: any) => {
    return (
      <g key={node.index}>
        <rect
          height={node.y1 - node.y0}
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0}
          stroke={"black"}
          fill={colorScale(node.category)}
          fillOpacity={1}
          rx={0.9}
          className="transition-all duration-200 cursor-pointer"
          style={{
            opacity: hoveredNode === node.name ? 0.9 : 1,
            transform: hoveredNode === node.name ? 'scale(1.02)' : 'scale(1)',
          }}
          onMouseEnter={() => setHoveredNode(node.name)}
          onMouseLeave={() => setHoveredNode(null)}
        />
      </g>
    );
  });

  // Render links
  const allLinks = links.map((link: any, i: number) => {
    const linkGenerator = sankeyLinkHorizontal();
    const path = linkGenerator(link);

    return (
      <path
        key={i}
        d={path || ''}
        stroke={colorScale(link.source.category)}
        fill="none"
        strokeOpacity={hoveredLink === i ? 0.8 : 0.3}
        strokeWidth={link.width}
        className="transition-all duration-200 cursor-pointer"
        onMouseEnter={() => setHoveredLink(i)}
        onMouseLeave={() => setHoveredLink(null)}
      />
    );
  });

  // Render labels
  const allLabels = nodes.map((node: any, i: number) => {
    return (
      <text
        key={i}
        x={node.x0 < containerWidth / 2 ? node.x1 + 6 : node.x0 - 6}
        y={(node.y1 + node.y0) / 2}
        dy="0.35rem"
        textAnchor={node.x0 < containerWidth / 2 ? "start" : "end"}
        fontSize={12}
        className="fill-gray-700 font-medium"
      >
        {node.name}
      </text>
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Money Flow Visualization
        </h3>
        <p className="text-sm text-gray-600">
          See how your monthly income flows into expenses and savings
        </p>
      </div>

      <div className="relative">
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              Zoom Out
            </button>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              Zoom In
            </button>
            <button
              onClick={resetView}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border"
            >
              Reset View
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Zoom: {Math.round(zoom * 100)}% | Scroll to zoom, drag to pan
            <span className="ml-4 text-xs">
              Proper Sankey flow conservation
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div 
          className="border border-gray-200 rounded-lg overflow-hidden"
          style={{ height: '600px', cursor: isDragging ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${-pan.x} ${-pan.y} ${containerWidth / zoom} ${containerHeight / zoom}`}
            style={{ 
              minWidth: containerWidth * zoom, 
              minHeight: containerHeight * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {allLinks}
            {allNodes}
            {allLabels}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-10 pointer-events-none">
          {(() => {
            const node = nodes.find((n: any) => n.name === hoveredNode);
            if (!node) return null;
            return (
              <div>
                <div className="font-semibold">{(node as any).name}</div>
                <div className="text-gray-300">{formatCurrency((node as any).value)}</div>
                {(node as any).name === 'Monthly Income' && (
                  <div className="text-xs text-gray-400 mt-1">
                    {data.savingsPercentage.toFixed(1)}% saved
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {nodes.map((node: any) => (
          <div key={node.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colorScale(node.category) }}
            />
            <span className="text-xs text-gray-600">
              {node.name}: {formatCurrency(node.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.monthlyNetIncome)}
          </div>
          <div className="text-sm text-gray-600">Total Income</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data.totalExpenses)}
          </div>
          <div className="text-sm text-gray-600">Total Expenses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.savings)}
          </div>
          <div className="text-sm text-gray-600">Savings ({data.savingsPercentage.toFixed(1)}%)</div>
        </div>
      </div>
    </div>
  );
};

export default SankeyChart;