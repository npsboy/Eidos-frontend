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

const getVisibleMetricKeys = (showMedianRelativeLikes) => {
  return showMedianRelativeLikes ? metricKeys : ['avgRelativeLikes', 'avgRelativeComments'];
};

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

const getYAxisDomain = (data, visibleMetricKeys) => {
  const values = data.flatMap((item) => visibleMetricKeys.map((key) => toNumeric(item[key])));
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

const normalizeCategoryName = (value) => String(value ?? '').trim().toLowerCase().replace(/[_\s]+/g, ' ');

const getCategoryDefinition = (categoryDefinitions, categoryType, categoryName) => {
  const group = categoryType ? categoryDefinitions?.[categoryType] : categoryDefinitions;
  if (!group || !categoryName) return '';

  const directMatch = group[categoryName];
  if (typeof directMatch === 'string') return directMatch;

  const normalizedCategoryName = normalizeCategoryName(categoryName);
  const matchedEntry = Object.entries(group).find(([key]) => normalizeCategoryName(key) === normalizedCategoryName);
  return matchedEntry ? String(matchedEntry[1] ?? '') : '';
};

const DoughnutLegendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <circle cx="7" cy="7" r="5" fill="none" stroke={colors.pieBg} strokeWidth="2" />
    <circle
      cx="7"
      cy="7"
      r="5"
      fill="none"
      stroke={colors.pieFill}
      strokeWidth="2"
      strokeDasharray="18 14"
      transform="rotate(-90 7 7)"
    />
    <circle cx="7" cy="7" r="2.2" fill={colors.background} />
  </svg>
);

// Custom tooltip to display Win Rate along with other metrics
const CustomTooltip = ({ active, payload, label, data, showWinRate }) => {
  if (active && payload && payload.length) {
    const dataItem = data.find(d => d.name === label);
    return (
      <div style={{ backgroundColor: '#2a2a2a', padding: '10px', border: '1px solid #444', borderRadius: '4px', color: 'white' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
        {showWinRate && (
          <p style={{ margin: '0 0 4px 0', color: '#6ab0f3' }}>Win Rate: {toPercent(dataItem?.winRate ?? 0)}</p>
        )}
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
  const { x, y, payload, data, showWinRate, categoryDefinitions, categoryType } = props;
  const dataItem = data.find(d => d.name === payload.value);
  const winRate = showWinRate && dataItem ? dataItem.winRate : 0;
  const categoryDefinition = getCategoryDefinition(categoryDefinitions, categoryType, payload.value);
  
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
      {showWinRate && (
        <g transform={`translate(0, -65)`}>
          <circle 
            cx="0" 
            cy="0" 
            r={radius} 
            fill="transparent" 
            stroke={colors.pieBg} 
            strokeWidth="6"
          />
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
      )}
      
      {/* X-Axis Text Label */}
      <foreignObject
        x={-78}
        y={line2 ? -40 : -30}
        width={156}
        height={line2 ? 42 : 26}
        overflow="visible"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            color: colors.text,
            fontSize: '12px',
            lineHeight: '1.15',
            textAlign: 'right',
            overflow: 'visible'
          }}
        >
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span>{line1}</span>
            {line2 && <span>{line2}</span>}
          </span>
          {categoryDefinition && (
            <img
              src="/icons/info_icon.png"
              alt=""
              title={categoryDefinition}
              style={{ width: '12px', height: '12px', marginTop: line2 ? '0' : '1px', cursor: 'help', flexShrink: 0 }}
            />
          )}
        </div>
      </foreignObject>
      
      {/* Target line indicating the baseline for the top labels */}
      <line x1="-50" y1="-2" x2="50" y2="-2" stroke={colors.grid} strokeWidth="1" />
    </g>
  );
};

const CustomLegend = ({ showWinRate, showMedianRelativeLikes }) => {
  const items = [
    { label: 'Avg Relative Likes', color: colors.avgRelativeLikes },
    { label: 'Avg Relative Comments', color: colors.avgRelativeComments },
    { label: 'Negative Values Accent', color: colors.avgRelativeLikesNegative }
  ];

  if (showMedianRelativeLikes) {
    items.splice(1, 0, { label: 'Median Relative Likes', color: colors.medianRelativeLikes });
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', paddingTop: '20px' }}>
      {showWinRate && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a9a9a9', fontSize: '14px' }}>
          <DoughnutLegendIcon />
          <span>Win Rate (% of brands that got a positive lift)</span>
        </div>
      )}
      {items.map((item) => (
        <div key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a9a9a9', fontSize: '14px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const ClassificationPerformanceChart = ({
  title = "Intent Performance",
  data = intentDummyData,
  showWinRate = true,
  showMedianRelativeLikes = true,
  categoryDefinitions = null,
  categoryType = null
}) => {
  const visibleMetricKeys = getVisibleMetricKeys(showMedianRelativeLikes);

  const normalizedData = useMemo(() => {
    const baseRows = data.map((item) => ({
      ...item,
      winRate: toNumeric(item.winRate),
      avgRelativeLikes: toNumeric(item.avgRelativeLikes),
      medianRelativeLikes: showMedianRelativeLikes ? toNumeric(item.medianRelativeLikes) : 0,
      avgRelativeComments: toNumeric(item.avgRelativeComments)
    }));

    const winRateScale = getScaleForField(baseRows, 'winRate');
    const metricScales = {
      avgRelativeLikes: getScaleForField(baseRows, 'avgRelativeLikes'),
      medianRelativeLikes: showMedianRelativeLikes ? getScaleForField(baseRows, 'medianRelativeLikes') : 1,
      avgRelativeComments: getScaleForField(baseRows, 'avgRelativeComments')
    };

    return baseRows.map((item) => ({
      ...item,
      winRate: item.winRate * winRateScale,
      avgRelativeLikes: item.avgRelativeLikes * metricScales.avgRelativeLikes,
      medianRelativeLikes: showMedianRelativeLikes ? item.medianRelativeLikes * metricScales.medianRelativeLikes : 0,
      avgRelativeComments: item.avgRelativeComments * metricScales.avgRelativeComments
    }));
  }, [data, showMedianRelativeLikes]);

  const [yMin, yMax] = useMemo(() => getYAxisDomain(normalizedData, visibleMetricKeys), [normalizedData, visibleMetricKeys]);

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
            tick={(props) => (
              <CustomTick
                {...props}
                data={normalizedData}
                showWinRate={showWinRate}
                categoryDefinitions={categoryDefinitions}
                categoryType={categoryType}
              />
            )}
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
            content={(props) => <CustomTooltip {...props} data={normalizedData} showWinRate={showWinRate} />}
          />
          
          <Legend 
            content={<CustomLegend showWinRate={showWinRate} showMedianRelativeLikes={showMedianRelativeLikes} />}
          />
          
          <Bar dataKey="avgRelativeLikes" name="Avg Relative Likes" barSize={20} minPointSize={3}>
            {normalizedData.map((entry, index) => (
              <Cell
                key={`avgRelativeLikes-${entry.name}-${index}`}
                fill={entry.avgRelativeLikes < 0 ? colors.avgRelativeLikesNegative : colors.avgRelativeLikes}
              />
            ))}
          </Bar>
          {showMedianRelativeLikes && (
            <Bar dataKey="medianRelativeLikes" name="Median Relative Likes" barSize={20} minPointSize={3}>
              {normalizedData.map((entry, index) => (
                <Cell
                  key={`medianRelativeLikes-${entry.name}-${index}`}
                  fill={entry.medianRelativeLikes < 0 ? colors.medianRelativeLikesNegative : colors.medianRelativeLikes}
                />
              ))}
            </Bar>
          )}
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
