import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ClassificationPerformanceChart from '../ClassificationPerformanceChart/ClassificationPerformanceChart';
import './IndividualAccountInsights.css';

const formatNumber = (value) => {
  const normalizedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const numericValue = Number.parseFloat(normalizedValue);
  if (!Number.isFinite(numericValue)) return '0';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(numericValue);
};

const parseMetricValue = (value) => {
  const normalizedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const numericValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const calculateReachToInteractionRatio = (followersCount, averageLikes) => {
  if (!Number.isFinite(followersCount) || followersCount <= 0) return 0;
  return averageLikes / followersCount;
};

const IndividualAccountInsights = ({ accounts, accountAnalysisData }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(accounts && accounts.length > 0 ? accounts[0] : null);

  useEffect(() => {
    if (!selectedAccount && accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  if (!accountAnalysisData || !accounts || accounts.length === 0) return null;

  const selectedAccountData = selectedAccount ? accountAnalysisData[selectedAccount] : null;
  const followersCount = parseMetricValue(selectedAccountData?.followersCount ?? selectedAccountData?.followers_count ?? 0);
  const averageLikes = parseMetricValue(selectedAccountData?.averageLikesComments?.avgLikes ?? 0);
  const averageComments = parseMetricValue(selectedAccountData?.averageLikesComments?.avgComments ?? 0);
  const averageEngagement = averageLikes + averageComments;
  const engagementRate = calculateReachToInteractionRatio(followersCount, averageEngagement);

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

          {selectedAccountData && (
            <div className="account-charts">
              <div className="account-summary">
                <div className="followers-summary">
                  <span className="summary-label">Followers</span>
                  <span className="summary-value">{formatNumber(followersCount)}</span>
                </div>

                <div className="followers-summary">
                  <span className="summary-label">Average engagement</span>
                  <span className="summary-value">{formatNumber(averageEngagement)}</span>
                </div>

                <div className="ratio-summary">
                  <div className="ratio-summary-copy">
                    <span className="summary-label">Engagement rate</span>
                    <span className="summary-helper">average interaction / followersCount</span>
                  </div>
                  <span className="ratio-value">{engagementRate.toFixed(4)}</span>
                </div>
              </div>

              <ClassificationPerformanceChart 
                title="Intent Performance" 
                showWinRate={false}
                showMedianRelativeLikes={false}
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
                showWinRate={false}
                showMedianRelativeLikes={false}
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
