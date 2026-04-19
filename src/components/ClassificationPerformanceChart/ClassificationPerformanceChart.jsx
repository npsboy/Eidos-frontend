import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Dummy data for the chart based roughly on the attached image
export const intentDummyData = [
  {
    name: 'Promotional',
    winRate: 66,
    avgRelativeLikes: 4.2,
    medianRelativeLikes: 2.4,
    avgRelativeComments: 2.0,
  },
  {
    name: 'Educational',
    winRate: 0,
    avgRelativeLikes: -2.5,
    medianRelativeLikes: -4.4,
    avgRelativeComments: -2.0,
  },
  {
    name: 'Engagement',
    winRate: 34,
    avgRelativeLikes: 3.5,
    medianRelativeLikes: 1.8,
    avgRelativeComments: 3.0,
  },
  {
    name: 'Branding',
    winRate: 66,
    avgRelativeLikes: 4.5,
    medianRelativeLikes: 2.8,
    avgRelativeComments: 5.0,
  },
  {
    name: 'Social Proof',
    winRate: 0,
    avgRelativeLikes: -3.7,
    medianRelativeLikes: -4.5,
    avgRelativeComments: -2.3,
  },
  {
    name: 'Announcement',
    winRate: 34,
    avgRelativeLikes: 2.3,
    medianRelativeLikes: -3.2,
    avgRelativeComments: 4.3,
  },
  {
    name: 'Entertainment',
    winRate: 66,
    avgRelativeLikes: 6.7,
    medianRelativeLikes: 3.1,
    avgRelativeComments: -5.6,
  },
];

export const formatDummyData = [
  {
    name: 'Trend',
    winRate: 66,
    avgRelativeLikes: 4.3,
    medianRelativeLikes: 2.4,
    avgRelativeComments: 2.0,
  },
  {
    name: 'Meme',
    winRate: 0,
    avgRelativeLikes: -2.5,
    medianRelativeLikes: -4.4,
    avgRelativeComments: -2.0,
  },
  {
    name: 'Tutorial',
    winRate: 34,
    avgRelativeLikes: 3.5,
    medianRelativeLikes: 1.8,
    avgRelativeComments: 3.0,
  },
  {
    name: 'Behind the scenes',
    winRate: 66,
    avgRelativeLikes: 4.5,
    medianRelativeLikes: 2.8,
    avgRelativeComments: 5.0,
  },
  {
    name: 'User generated content',
    winRate: 0,
    avgRelativeLikes: -3.7,
    medianRelativeLikes: -4.5,
    avgRelativeComments: -2.3,
  },
  {
    name: 'Influencer collaboration',
    winRate: 34,
    avgRelativeLikes: 2.3,
    medianRelativeLikes: -3.2,
    avgRelativeComments: 4.3,
  },
  {
    name: 'Event',
    winRate: 66,
    avgRelativeLikes: 6.7,
    medianRelativeLikes: 3.1,
    avgRelativeComments: -5.6,
  },
];

const colors = {
  avgRelativeLikes: '#5c8a3f', // dark green
  medianRelativeLikes: '#7ab148', // medium green
  avgRelativeComments: '#b4cfa1', // light green
  background: '#1a1a1a',
  text: '#8c8c8c',
  grid: '#404040',
  pieBg: '#8c8c8c',
  pieFill: '#2b5a8c' // blue for the pie chart
};

// Custom toolip to display Win Rate along with other metrics
const CustomTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const dataItem = data.find(d => d.name === label);
    return (
      <div style={{ backgroundColor: '#2a2a2a', padding: '10px', border: '1px solid #444', borderRadius: '4px', color: 'white' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: '0 0 4px 0', color: '#6ab0f3' }}>Win Rate: {dataItem?.winRate ?? 0}%</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '0 0 4px 0', color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Custom axis tick to render the pie chart above the labels
const CustomTick = (props) => {
  const { x, y, payload, data } = props;
  const dataItem = data.find(d => d.name === payload.value);
  const winRate = dataItem ? dataItem.winRate : 0;
  
  // Format labels to break on spaces if fairly long
  const words = payload.value.split(' ');
  let line1 = payload.value;
  let line2 = '';
  if (words.length > 2) {
    line1 = words.slice(0, 2).join(' ');
    line2 = words.slice(2).join(' ');
  } else if (words.length === 2 && payload.value.length > 15) {
    line1 = words[0];
    line2 = words[1];
  }
  
  // Simple SVG pie chart implementation (circle + stroke dasharray for the slice)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(winRate / 100) * circumference} ${circumference}`;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Container for Pie Chart */}
      <g transform={`translate(0, -35)`}>
        {/* Background circle */}
        <circle 
          cx="0" 
          cy="0" 
          r={radius} 
          fill="transparent" 
          stroke={colors.pieBg} 
          strokeWidth="6"
        />
        {/* Filled portion of pie chart */}
        <circle 
          cx="0" 
          cy="0" 
          r={radius} 
          fill="transparent" 
          stroke={colors.pieFill} 
          strokeWidth="6"
          strokeDasharray={strokeDasharray}
          transform="rotate(-90 0 0)"
        />
        {/* Label inside pie chart */}
        <text 
          x="0" 
          y="0" 
          dy="4" 
          textAnchor="middle" 
          fill="white" 
          fontSize="12" 
          fontWeight="bold"
        >
          {winRate}%
        </text>
      </g>
      
      {/* X-Axis Text Label */}
      {line2 ? (
        <>
          <text x={0} y={0} dy={14} textAnchor="middle" fill={colors.text} fontSize="12">
            {line1}
          </text>
          <text x={0} y={0} dy={28} textAnchor="middle" fill={colors.text} fontSize="12">
            {line2}
          </text>
        </>
      ) : (
        <text x={0} y={0} dy={16} textAnchor="middle" fill={colors.text} fontSize="12">
          {payload.value}
        </text>
      )}
      
      {/* Target line indicating the baseline for the top labels */}
      <line x1="-50" y1="38" x2="50" y2="38" stroke={colors.grid} strokeWidth="1" />
    </g>
  );
};

export const ClassificationPerformanceChart = ({ title = "Intent Performance", data = intentDummyData }) => {
  return (
    <div style={{ width: '100%', height: '550px', backgroundColor: colors.background, padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 70, // Space for the pie charts
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          
          <XAxis 
            dataKey="name" 
            orientation="top"
            axisLine={false}
            tickLine={false}
            tick={(props) => <CustomTick {...props} data={data} />}
            interval={0}
          />
          
          <YAxis 
            tickFormatter={(val) => `${val.toFixed(2)}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text }}
            domain={[-8, 8]}
            ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
          />
          
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            content={(props) => <CustomTooltip {...props} data={data} />}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          
          <Bar dataKey="avgRelativeLikes" name="Avg Relative Likes" fill={colors.avgRelativeLikes} barSize={20} />
          <Bar dataKey="medianRelativeLikes" name="Median Relative Likes" fill={colors.medianRelativeLikes} barSize={20} />
          <Bar dataKey="avgRelativeComments" name="Avg Relative Comments" fill={colors.avgRelativeComments} barSize={20} />
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationPerformanceChart;
