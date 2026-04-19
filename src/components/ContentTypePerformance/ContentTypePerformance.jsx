import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Reels', value: 65, color: '#5c8a3f' }, // dark green
  { name: 'Posts', value: 35, color: '#b4cfa1' }, // light green
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  // Position the label centered within the slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#1a1a1a" // Dark text to stand out against green
      textAnchor="middle" 
      dominantBaseline="central" 
      fontSize="12" 
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ContentTypePerformance = () => {
  return (
    <div style={{
      backgroundColor: '#212121', // Lighter background color so it stands out against main dashboard #1a1a1a
      padding: '40px 30px', 
      borderRadius: '8px', 
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: '350px'
    }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '500' }}>Content Type Performance</h2>
        <p style={{ color: '#8c8c8c', margin: 0, fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '85%' }}>
          Percentage of likes received for reels vs posts
        </p>
      </div>
      <div style={{ flex: 1, height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={130}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="square"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span style={{ color: '#8c8c8c', marginRight: '15px' }}>{value}</span>}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '4px', color: 'white' }}
              itemStyle={{ color: 'white' }}
              formatter={(value) => [`${value}%`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContentTypePerformance;
