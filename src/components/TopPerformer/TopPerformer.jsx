import React from 'react';
import { Award } from 'lucide-react';

const TopPerformer = ({ account = "Nike", frequency = "5 days" }) => {
  return (
    <div style={{
      backgroundColor: '#212121', // Lighter background color so it stands out against main dashboard #1a1a1a
      padding: '24px 30px', 
      borderRadius: '8px', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Award size={24} color="white" />
        <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: '500' }}>Top Performer</h2>
      </div>
      <div style={{ marginLeft: '36px' }}>
        <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '8px' }}>{account}</div>
        <div style={{ color: '#8c8c8c', fontSize: '1rem' }}>Posts on average every {frequency}.</div>
      </div>
    </div>
  );
};

export default TopPerformer;
