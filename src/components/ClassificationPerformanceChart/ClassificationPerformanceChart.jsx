import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
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
  avgRelativeLikesNegative: '#b94f4f',
  medianRelativeLikes: '#7ab148', // medium green
  medianRelativeLikesNegative: '#cf5e5e',
  avgRelativeComments: '#b4cfa1', // light green
  avgRelativeCommentsNegative: '#e07a7a',
  background: '#212121', // updated to be lighter than the main background
  text: '#8c8c8c',
  grid: '#404040',
  zeroLine: '#4da3ff',
  pieBg: '#8c8c8c',
  pieFill: '#2b5a8c' // blue for the pie chart
};

const metricKeys = ['avgRelativeLikes', 'medianRelativeLikes', 'avgRelativeComments'];

const toNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toPercent = (value) => `${toNumeric(value).toFixed(2)}%`;

const getScaleForField = (rows, key) => {
  const nonZeroValues = rows
    .map((row) => Math.abs(toNumeric(row[key])))
    .filter((value) => value > 0);

  if (nonZeroValues.length === 0) return 1;

  // If all values are in fractional form (0..1), normalize to percentage points.
  return Math.max(...nonZeroValues) <= 1 ? 100 : 1;
};

const getYAxisDomain = (data) => {
  const values = data.flatMap((item) => metricKeys.map((key) => toNumeric(item[key])));
  if (values.length === 0) return [-10, 10];

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const spread = max - min;
  const padding = Math.max(spread * 0.15, 2);
  const lower = Math.floor((min - padding) / 2) * 2;
  const upper = Math.ceil((max + padding) / 2) * 2;

  if (lower === upper) {
    return [lower - 2, upper + 2];
  }

  return [lower, upper];
};

// Custom toolip to display Win Rate along with other metrics
const CustomTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const dataItem = data.find(d => d.name === label);
    return (
      <div style={{ backgroundColor: '#2a2a2a', padding: '10px', border: '1px solid #444', borderRadius: '4px', color: 'white' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: '0 0 4px 0', color: '#6ab0f3' }}>Win Rate: {toPercent(dataItem?.winRate ?? 0)}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '0 0 4px 0', color: entry.color }}>
            {entry.name}: {toPercent(entry.value)}
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
      <g transform={`translate(0, -65)`}>
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
          <text x={0} y={-24} textAnchor="middle" fill={colors.text} fontSize="12">
            {line1}
          </text>
          <text x={0} y={-10} textAnchor="middle" fill={colors.text} fontSize="12">
            {line2}
          </text>
        </>
      ) : (
        <text x={0} y={-18} textAnchor="middle" fill={colors.text} fontSize="12">
          {payload.value}
        </text>
      )}
      
      {/* Target line indicating the baseline for the top labels */}
      <line x1="-50" y1="-2" x2="50" y2="-2" stroke={colors.grid} strokeWidth="1" />
    </g>
  );
};

const CustomLegend = () => {
  const items = [
    { label: 'Avg Relative Likes', color: colors.avgRelativeLikes },
    { label: 'Median Relative Likes', color: colors.medianRelativeLikes },
    { label: 'Avg Relative Comments', color: colors.avgRelativeComments },
    { label: 'Negative Values Accent', color: colors.avgRelativeLikesNegative }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', paddingTop: '20px' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a9a9a9', fontSize: '14px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const ClassificationPerformanceChart = ({ title = "Intent Performance", data = intentDummyData }) => {
  const normalizedData = useMemo(() => {
    const baseRows = data.map((item) => ({
      ...item,
      winRate: toNumeric(item.winRate),
      avgRelativeLikes: toNumeric(item.avgRelativeLikes),
      medianRelativeLikes: toNumeric(item.medianRelativeLikes),
      avgRelativeComments: toNumeric(item.avgRelativeComments)
    }));

    const winRateScale = getScaleForField(baseRows, 'winRate');
    const metricScales = {
      avgRelativeLikes: getScaleForField(baseRows, 'avgRelativeLikes'),
      medianRelativeLikes: getScaleForField(baseRows, 'medianRelativeLikes'),
      avgRelativeComments: getScaleForField(baseRows, 'avgRelativeComments')
    };

    return baseRows.map((item) => ({
      ...item,
      winRate: item.winRate * winRateScale,
      avgRelativeLikes: item.avgRelativeLikes * metricScales.avgRelativeLikes,
      medianRelativeLikes: item.medianRelativeLikes * metricScales.medianRelativeLikes,
      avgRelativeComments: item.avgRelativeComments * metricScales.avgRelativeComments
    }));
  }, [data]);

  const [yMin, yMax] = useMemo(() => getYAxisDomain(normalizedData), [normalizedData]);

  return (
    <div style={{ width: '100%', height: '550px', backgroundColor: colors.background, padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={normalizedData}
          margin={{
            top: 100, // Increased space to stop overlapping labels/pie charts
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <ReferenceLine y={0} stroke={colors.zeroLine} strokeDasharray="5 5" strokeWidth={1.5} />
          
          <XAxis 
            dataKey="name" 
            orientation="top"
            axisLine={false}
            tickLine={false}
            tick={(props) => <CustomTick {...props} data={normalizedData} />}
            interval={0}
          />
          
          <YAxis 
            tickFormatter={(val) => toPercent(val)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text }}
            domain={[yMin, yMax]}
          />
          
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            content={(props) => <CustomTooltip {...props} data={normalizedData} />}
          />
          
          <Legend 
            content={<CustomLegend />}
          />
          
          <Bar dataKey="avgRelativeLikes" name="Avg Relative Likes" barSize={20} minPointSize={3}>
            {normalizedData.map((entry, index) => (
              <Cell
                key={`avgRelativeLikes-${entry.name}-${index}`}
                fill={entry.avgRelativeLikes < 0 ? colors.avgRelativeLikesNegative : colors.avgRelativeLikes}
              />
            ))}
          </Bar>
          <Bar dataKey="medianRelativeLikes" name="Median Relative Likes" barSize={20} minPointSize={3}>
            {normalizedData.map((entry, index) => (
              <Cell
                key={`medianRelativeLikes-${entry.name}-${index}`}
                fill={entry.medianRelativeLikes < 0 ? colors.medianRelativeLikesNegative : colors.medianRelativeLikes}
              />
            ))}
          </Bar>
          <Bar dataKey="avgRelativeComments" name="Avg Relative Comments" barSize={20} minPointSize={3}>
            {normalizedData.map((entry, index) => (
              <Cell
                key={`avgRelativeComments-${entry.name}-${index}`}
                fill={entry.avgRelativeComments < 0 ? colors.avgRelativeCommentsNegative : colors.avgRelativeComments}
              />
            ))}
          </Bar>
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationPerformanceChart;
