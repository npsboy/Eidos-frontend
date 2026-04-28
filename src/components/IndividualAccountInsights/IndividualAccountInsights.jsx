import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ClassificationPerformanceChart from '../ClassificationPerformanceChart/ClassificationPerformanceChart';
import './IndividualAccountInsights.css';

const IndividualAccountInsights = ({ accounts, accountAnalysisData }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(accounts && accounts.length > 0 ? accounts[0] : null);

  useEffect(() => {
    if (!selectedAccount && accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  if (!accountAnalysisData || !accounts || accounts.length === 0) return null;

  return (
    <div className="individual-account-insights">
      <div 
        className="insights-header" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2>Individual Account Insights</h2>
        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </div>
      
      {!isCollapsed && (
        <div className="insights-content">
          <div className="account-navbar">
            {accounts.map(acc => (
              <div 
                key={acc} 
                className={`account-nav-item ${selectedAccount === acc ? 'selected' : ''}`}
                onClick={() => setSelectedAccount(acc)}
              >
                {acc}
              </div>
            ))}
          </div>

          {selectedAccount && accountAnalysisData[selectedAccount] && (
            <div className="account-charts">
              <ClassificationPerformanceChart 
                title="Intent Performance" 
                data={Object.entries(accountAnalysisData[selectedAccount].intentDistribution || {}).map(([name, data]) => ({
                  name,
                  winRate: data.relative_performance?.winRate ? parseFloat(data.relative_performance.winRate) : 0,
                  avgRelativeLikes: parseFloat(data.relative_performance?.likes || 0),
                  medianRelativeLikes: 0,
                  avgRelativeComments: parseFloat(data.relative_performance?.comments || 0)
                }))} 
              />
              <ClassificationPerformanceChart 
                title="Format Performance" 
                data={Object.entries(accountAnalysisData[selectedAccount].formatDistribution || {}).map(([name, data]) => ({
                  name,
                  winRate: data.relative_performance?.winRate ? parseFloat(data.relative_performance.winRate) : 0,
                  avgRelativeLikes: parseFloat(data.relative_performance?.likes || 0),
                  medianRelativeLikes: 0,
                  avgRelativeComments: parseFloat(data.relative_performance?.comments || 0)
                }))} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndividualAccountInsights;
