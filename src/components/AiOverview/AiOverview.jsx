import React from 'react';

const AiOverview = ({ aiOverviewData = null, excelPath = '' }) => {
  return (
    <div style={{
      backgroundColor: '#212121', 
      padding: '40px 30px', 
      borderRadius: '8px', 
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: '400' }}>AI Overview</h2>
      
      <div style={{ 
        color: '#b0b0b0', // Light gray for the text
        fontSize: '1.1rem', 
        lineHeight: '1.7',
        maxWidth: '850px' // Keep reading length comfortable
      }}>
        {aiOverviewData ? (
          <p style={{ margin: '0 0 20px 0' }}>{aiOverviewData}</p>
        ) : (
          <>
            <p style={{ margin: '0 0 20px 0' }}>
              Influencer collaborations is the clear winner, delivering a 6.67% lift in likes with a 100% win rate across brands. Conversely, <span style={{ color: '#e0e0e0', fontWeight: '500' }}>Announcements</span>, <span style={{ color: '#e0e0e0', fontWeight: '500' }}>Behind-the-Scenes</span>, and <span style={{ color: '#e0e0e0', fontWeight: '500' }}>Event</span> formats underperform, showing a negative average engagement trend.
            </p>
            
            <p style={{ margin: '0 0 20px 0' }}>
              <span style={{ color: '#e0e0e0', fontWeight: '500' }}>Reels</span> are highly effective, outperforming static posts by 14.29%. Regarding timing, engagement peaks in the late evening, specifically between <span style={{ color: '#e0e0e0', fontWeight: '500' }}>20:00 and 22:00</span>. Notably, while most intents showed neutral results, the success of UGC suggests that authenticity drives significantly more engagement than traditional brand-led content.
            </p>
          </>
        )}
        
        {excelPath && (
          <p style={{ margin: 0 }}>
            Saved insights to {excelPath}
          </p>
        )}
      </div>
    </div>
  );
};

export default AiOverview;
