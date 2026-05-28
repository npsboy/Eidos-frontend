import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const colors = {
  background: '#212121',
  text: '#8c8c8c',
  grid: '#404040',
  zeroLine: '#4da3ff',
  likes: '#f0b35d',
  comments: '#7dd3fc'
};

const timeWindows = Array.from({ length: 12 }, (_, index) => {
  const startHour = index * 2;
  const endHour = startHour + 2;
  return {
    startHour,
    label: `${startHour}:00 to ${endHour}:00`
  };
});

const toNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getStartHour = (windowLabel) => {
  const match = String(windowLabel).match(/(\d{1,2})\s*:\s*\d{2}\s*(?:to|-)/i);
  return match ? Number.parseInt(match[1], 10) : null;
};

const normalizeTimeOfDayData = (timeOfDayEngagement) => {
  const sourceEntries = Array.isArray(timeOfDayEngagement)
    ? timeOfDayEngagement.map((item) => [item?.label || item?.window || item?.timeWindow, item])
    : Object.entries(timeOfDayEngagement || {});

  const byStartHour = new Map();

  sourceEntries.forEach(([windowLabel, value]) => {
    const startHour = getStartHour(windowLabel);
    if (startHour === null) return;

    byStartHour.set(startHour, {
      avgLikes: toNumeric(value?.avgLikes ?? value?.averageLikes ?? value?.likes ?? 0),
      avgComments: toNumeric(value?.avgComments ?? value?.averageComments ?? value?.comments ?? 0)
    });
  });

  return timeWindows.map(({ startHour, label }) => {
    const dataPoint = byStartHour.get(startHour) || { avgLikes: 0, avgComments: 0 };
    return {
      label,
      avgLikes: dataPoint.avgLikes,
      avgComments: dataPoint.avgComments
    };
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#2a2a2a', padding: '10px 12px', border: '1px solid #444', borderRadius: '4px', color: 'white' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ margin: '0 0 4px 0', color: entry.color }}>
          {entry.name}: {toNumeric(entry.value)}
        </p>
      ))}
    </div>
  );
};

const getYAxisDomain = (data) => {
  const values = data.flatMap((item) => [toNumeric(item.avgLikes), toNumeric(item.avgComments)]);
  const maxValue = Math.max(...values, 0);
  const upper = maxValue <= 0 ? 5 : maxValue * 1.15;
  return [0, Math.ceil(upper)];
};

const TimeOfDayEngagement = ({ timeOfDayEngagement }) => {
  const chartData = useMemo(() => normalizeTimeOfDayData(timeOfDayEngagement), [timeOfDayEngagement]);
  const yAxisDomain = useMemo(() => getYAxisDomain(chartData), [chartData]);

  return (
    <div style={{
      backgroundColor: colors.background,
      padding: '24px 30px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '420px'
    }}>
      <div>
        <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '500' }}>Time of Day Engagement</h2>
        <p style={{ color: colors.text, margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
          Average likes and comments across every two-hour window. Missing windows are shown as zero.
        </p>
      </div>

      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <ReferenceLine y={0} stroke={colors.zeroLine} strokeDasharray="5 5" strokeWidth={1.5} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.text, fontSize: 12 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.text }}
              allowDecimals={false}
              domain={yAxisDomain}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
            <Legend
              wrapperStyle={{ color: colors.text, paddingTop: '8px' }}
              formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="avgLikes"
              name="Avg Likes"
              stroke={colors.likes}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="avgComments"
              name="Avg Comments"
              stroke={colors.comments}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeOfDayEngagement;