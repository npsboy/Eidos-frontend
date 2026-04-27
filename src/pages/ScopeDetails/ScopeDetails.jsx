import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Link as LinkIcon, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ClassificationPerformanceChart, { intentDummyData, formatDummyData } from '../../components/ClassificationPerformanceChart/ClassificationPerformanceChart';
import TopPerformer from '../../components/TopPerformer/TopPerformer';
import ContentTypePerformance from '../../components/ContentTypePerformance/ContentTypePerformance';
import AiOverview from '../../components/AiOverview/AiOverview';
import './ScopeDetails.css';

const defaultIntents = [
  { id: 'i1', name: 'Promotional', isEditing: false },
  { id: 'i2', name: 'Educational', isEditing: false },
  { id: 'i3', name: 'Engagement', isEditing: false },
  { id: 'i4', name: 'Branding', isEditing: false },
  { id: 'i5', name: 'Social_Proof', isEditing: false },
  { id: 'i6', name: 'Announcement', isEditing: false },
  { id: 'i7', name: 'Entertainment', isEditing: false }
];

const defaultFormats = [
  { id: 'f1', name: 'Trend', isEditing: false },
  { id: 'f2', name: 'Meme', isEditing: false },
  { id: 'f3', name: 'Tutorial', isEditing: false },
  { id: 'f4', name: 'Behind_the_Scenes', isEditing: false },
  { id: 'f5', name: 'User_Generated_Content', isEditing: false },
  { id: 'f6', name: 'Influencer_Collaboration', isEditing: false },
  { id: 'f7', name: 'Aesthetic', isEditing: false },
  { id: 'f8', name: 'event', isEditing: false }
];

const streamStageLabels = {
  extracting_posts: 'Extracting posts',
  analyzing_post: 'Analyzing post',
  analyzing_data: 'Analyzing data'
};

const parseSseChunk = (chunk, onEvent) => {
  const events = [];
  let cursor = 0;

  while (cursor < chunk.length) {
    const separatorIndex = chunk.indexOf('\n\n', cursor);
    if (separatorIndex === -1) break;

    const block = chunk.slice(cursor, separatorIndex).trim();
    cursor = separatorIndex + 2;

    if (!block) continue;

    let eventName = 'message';
    const dataLines = [];

    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length > 0) {
      events.push({ eventName, data: dataLines.join('\n') });
    }
  }

  if (events.length > 0) {
    events.forEach(onEvent);
  }

  return chunk.slice(cursor);
};

const ScopeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const [scope, setScope] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [accounts, setAccounts] = useState([]);
  
  const [intents, setIntents] = useState(defaultIntents);
  const [formats, setFormats] = useState(defaultFormats);
  
  const [intentExpanded, setIntentExpanded] = useState(false);
  const [formatExpanded, setFormatExpanded] = useState(false);
  
  const [intentEditing, setIntentEditing] = useState(false);
  const [formatEditing, setFormatEditing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [streamEvents, setStreamEvents] = useState([]);

  const [additionalSettings, setAdditionalSettings] = useState({
    aiOverview: true,
    postingTimes: true,
    topPerformerInsights: true,
    maxPostsPerAccount: 50
  });

  useEffect(() => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    if (savedScopes) {
      const parsedScopes = JSON.parse(savedScopes);
      const foundScope = parsedScopes.find(s => s.id === id);
      if (foundScope) {
        setScope(foundScope);
        setAccounts(foundScope.accountList || []);
        if (foundScope.intents) setIntents(foundScope.intents);
        if (foundScope.formats) setFormats(foundScope.formats);
        if (foundScope.additionalSettings) setAdditionalSettings(foundScope.additionalSettings);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

const updateLocalStorage = (newAccounts, newIntents, newFormats, newAdditionalSettings) => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    if (savedScopes) {
      const parsedScopes = JSON.parse(savedScopes);
      const updatedScopes = parsedScopes.map(s =>
        s.id === id
          ? {
              ...s,
              accountList: newAccounts || accounts,
              accounts: (newAccounts || accounts).length > 0 ? (newAccounts || accounts).map(a => a.name).join(', ') : 'No accounts added',
              intents: newIntents || intents,
              formats: newFormats || formats,
              additionalSettings: newAdditionalSettings || additionalSettings
            }
          : s
      );
      localStorage.setItem('eidos_scopes', JSON.stringify(updatedScopes));
    }
  };

  const toggleSetting = (settingKey) => {
    const newSettings = { ...additionalSettings, [settingKey]: !additionalSettings[settingKey] };
    setAdditionalSettings(newSettings);
    updateLocalStorage(null, null, null, newSettings);
  };

  const updateSettingValue = (settingKey, value) => {
    const newSettings = { ...additionalSettings, [settingKey]: value };
    setAdditionalSettings(newSettings);
    updateLocalStorage(null, null, null, newSettings);
  };

  // Account Handlers
  const handleAddAccount = () => {
    const newAccount = { id: Date.now().toString(), name: '', isEditing: true };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts, null, null);
  };

  const handleDeleteAccount = (accountId) => {
    const newAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts, null, null);
  };

  const handleAccountNameChange = (accountId, newName) => {
    const newAccounts = accounts.map(a => a.id === accountId ? { ...a, name: newName } : a);
    setAccounts(newAccounts);
  };

  const finishEditingAccount = (accountId) => {
    const newAccounts = accounts.map(a => a.id === accountId ? { ...a, isEditing: false } : a);
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts, null, null);
  };

  const handleAccountKeyDown = (e, accountId) => {
    if (e.key === 'Enter') finishEditingAccount(accountId);
  };

  // Category Handlers
  const handleAddItem = (type) => {
    const newItem = { id: Date.now().toString(), name: '', isEditing: true };
    if (type === 'intent') {
      const newList = [...intents, newItem];
      setIntents(newList);
      updateLocalStorage(null, newList, null);
      setIntentExpanded(true);
    } else {
      const newList = [...formats, newItem];
      setFormats(newList);
      updateLocalStorage(null, null, newList);
      setFormatExpanded(true);
    }
  };

  const handleDeleteItem = (type, itemId) => {
    if (type === 'intent') {
      const newList = intents.filter(i => i.id !== itemId);
      setIntents(newList);
      updateLocalStorage(null, newList, null);
    } else {
      const newList = formats.filter(i => i.id !== itemId);
      setFormats(newList);
      updateLocalStorage(null, null, newList);
    }
  };

  const handleItemNameChange = (type, itemId, newName) => {
    if (type === 'intent') {
      setIntents(intents.map(i => i.id === itemId ? { ...i, name: newName } : i));
    } else {
      setFormats(formats.map(i => i.id === itemId ? { ...i, name: newName } : i));
    }
  };

  const finishEditingItem = (type, itemId) => {
    if (type === 'intent') {
      const newList = intents.map(i => i.id === itemId ? { ...i, isEditing: false } : i);
      setIntents(newList);
      updateLocalStorage(null, newList, null);
    } else {
      const newList = formats.map(i => i.id === itemId ? { ...i, isEditing: false } : i);
      setFormats(newList);
      updateLocalStorage(null, null, newList);
    }
  };

  const handleItemKeyDown = (e, type, itemId) => {
    if (e.key === 'Enter') finishEditingItem(type, itemId);
  };

  const handleRun = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setActiveTab('data');
    setAnalysisData(null); // Clear previous data
    setError(null);
    setStreamEvents([]);

    const payload = {
      accounts: accounts.map(a => a.name).filter(Boolean),
      maxPosts: additionalSettings.maxPostsPerAccount || 3,
      includeAiOverview: additionalSettings.aiOverview || false,
      categories: {
        intent: intents.map(i => i.name).filter(Boolean),
        format: formats.map(f => f.name).filter(Boolean)
      }
    };

    try {
      const response = await fetch('https://site--eidos--hp9jvjg6qc6c.code.run/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        signal: controller.signal,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const handleStreamEvent = ({ eventName, data }) => {
          if (!data) return;

          let parsedData;
          try {
            parsedData = JSON.parse(data);
          } catch (parseError) {
            console.error('Unable to parse SSE payload:', parseError);
            return;
          }

          if (eventName === 'progress') {
            setStreamEvents((currentEvents) => [
              ...currentEvents,
              {
                id: `${Date.now()}-${currentEvents.length}`,
                type: 'progress',
                stage: parsedData.stage,
                title: streamStageLabels[parsedData.stage] || parsedData.stage || 'Progress update',
                message: parsedData.message || 'Working...',
                account: parsedData.account,
                postNumber: parsedData.postNumber,
                link: parsedData.link
              }
            ]);
            return;
          }

          if (eventName === 'final') {
            setAnalysisData(parsedData);
            setStreamEvents((currentEvents) => [
              ...currentEvents,
              {
                id: `${Date.now()}-${currentEvents.length}`,
                type: 'final',
                title: 'Analysis complete',
                message: 'Full analysis payload received.'
              }
            ]);
          }

          if (eventName === 'done') {
            setStreamEvents((currentEvents) => [
              ...currentEvents,
              {
                id: `${Date.now()}-${currentEvents.length}`,
                type: 'done',
                title: 'Finished',
                message: parsedData.message || 'analysis complete'
              }
            ]);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          buffer = parseSseChunk(buffer, handleStreamEvent);
        }

        buffer += decoder.decode();
        parseSseChunk(buffer, handleStreamEvent);
      } else {
        const data = await response.json();
        setAnalysisData(data);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("Error analyzing data:", err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const renderCategoryList = (type, items, expanded, editing) => {
    const displayItems = expanded || editing ? items : items.slice(0, 2);
    return (
      <div className="category-items-list">
        {displayItems.map((item) => (
          <div key={item.id} className="category-item">
            {editing || item.isEditing ? (
              <div style={{ display: 'flex', width: '100%' }}>
                <input
                  className="category-item-input"
                  value={item.name}
                  onChange={(e) => handleItemNameChange(type, item.id, e.target.value)}
                  onBlur={() => finishEditingItem(type, item.id)}
                  onKeyDown={(e) => handleItemKeyDown(e, type, item.id)}
                  autoFocus={item.isEditing}
                />
                <button className="delete-account-btn" onClick={() => handleDeleteItem(type, item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <span>{item.name}</span>
            )}
          </div>
        ))}
        {!expanded && !editing && items.length > 2 && (
          <div className="more-lines">
            <div className="more-line"></div>
            <div className="more-line"></div>
          </div>
        )}
        {editing && (
          <button className="add-category-item-btn" onClick={() => handleAddItem(type)}>
            + Add new
          </button>
        )}
      </div>
    );
  };

  if (!scope) return <div className="scope-details-container"><Sidebar /></div>;

  return (
    <div className="scope-details-container">
      <Sidebar />
      <div className="scope-details-content">
        <div className="scope-header">
          <div className="scope-title-area">
            <h1>{scope.name}</h1>
            <div className="last-run">Last run: 28/07/2025</div>
          </div>
        </div>

        <div className="tabs">
          <div style={{ width: '60px' }}></div>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="tab-icon" />
            Scope Settings
          </button>
          <button
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Extracted Data
          </button>
        </div>

        <div className="scope-body">
          {activeTab === 'settings' ? (
            <>
              <div className="accounts-section">
                <h2>Accounts</h2>
                <div className="accounts-list">
                  {accounts.map((account) => (
                    <div key={account.id} className="account-item">
                      <div className="account-info">
                        <LinkIcon className="link-icon" />
                        {account.isEditing ? (
                          <input
                            className="account-input"
                            value={account.name}
                            onChange={(e) => handleAccountNameChange(account.id, e.target.value)}
                            onBlur={() => finishEditingAccount(account.id)}
                            onKeyDown={(e) => handleAccountKeyDown(e, account.id)}
                            autoFocus
                            placeholder="Account name..."
                          />
                        ) : (
                          <span 
                            className="account-name"
                            onClick={() => setAccounts(accounts.map(a => a.id === account.id ? { ...a, isEditing: true } : a))}
                          >
                            {account.name || 'Unnamed Account'}
                          </span>
                        )}
                      </div>
                      <button 
                        className="delete-account-btn" 
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="add-account-btn" onClick={handleAddAccount}>Add</button>
              </div>

              <div className="classification-section">
                <div className="classification-header">
                  Post Classification Categories
                </div>
                
                {/* Intent Category */}
                <div className="category-container">
                  <div className="category-top-bar">
                    <div 
                      className="category-title" 
                      onClick={() => setIntentExpanded(!intentExpanded)}
                    >
                      Intent {intentExpanded ? <ChevronUp className="category-title-icon" /> : <ChevronDown className="category-title-icon" />}
                    </div>
                    <button
                      className={`category-edit-btn ${intentEditing ? 'active' : ''}`}
                      onClick={() => setIntentEditing(!intentEditing)}
                    >
                      {intentEditing ? 'Save' : <>Edit <Edit2 size={14} /></>}
                    </button>
                  </div>
                  {renderCategoryList('intent', intents, intentExpanded, intentEditing)}
                </div>

                {/* Format Category */}
                <div className="category-container">
                  <div className="category-top-bar">
                    <div 
                      className="category-title" 
                      onClick={() => setFormatExpanded(!formatExpanded)}
                    >
                      Format {formatExpanded ? <ChevronUp className="category-title-icon" /> : <ChevronDown className="category-title-icon" />}
                    </div>
                    <button
                      className={`category-edit-btn ${formatEditing ? 'active' : ''}`}
                      onClick={() => setFormatEditing(!formatEditing)}
                    >
                      {formatEditing ? 'Save' : <>Edit <Edit2 size={14} /></>}
                    </button>
                  </div>
                  {renderCategoryList('format', formats, formatExpanded, formatEditing)}
                </div>
              </div>

              <div className="additional-settings-section">
                <div className="settings-header">Additional Settings</div>
                <div className="settings-content">
                  <div className="setting-item">
                    <span style={{ width: '180px' }}>AI Overview</span>
                    <button className={`toggle-switch ${additionalSettings.aiOverview ? 'on' : 'off'}`} onClick={() => toggleSetting('aiOverview')}>
                      <div className="toggle-handle"></div>
                    </button>
                  </div>
                  <div className="setting-item">
                    <span style={{ width: '180px' }}>Posting times</span>
                    <button className={`toggle-switch ${additionalSettings.postingTimes ? 'on' : 'off'}`} onClick={() => toggleSetting('postingTimes')}>
                      <div className="toggle-handle"></div>
                    </button>
                  </div>
                  <div className="setting-item">
                    <span style={{ width: '180px' }}>Top performer insights</span>
                    <button className={`toggle-switch ${additionalSettings.topPerformerInsights ? 'on' : 'off'}`} onClick={() => toggleSetting('topPerformerInsights')}>
                      <div className="toggle-handle"></div>
                    </button>
                  </div>
                  <div className="setting-item">
                    <span style={{ width: '180px' }}>Max posts per account</span>
                    <input 
                      type="number"
                      value={additionalSettings.maxPostsPerAccount !== undefined ? additionalSettings.maxPostsPerAccount : 50}
                      onChange={(e) => updateSettingValue('maxPostsPerAccount', Number(e.target.value))}
                      style={{ 
                        width: '50px', 
                        height: '28px',
                        backgroundColor: '#333333', 
                        border: 'none', 
                        borderRadius: '4px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '14px',
                        padding: '0 4px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="run-btn-container">
                <button className="run-btn" onClick={handleRun} disabled={isLoading}>
                  {isLoading ? 'Running...' : 'Run'}
                </button>
              </div>
            </>
          ) : (
            <div className="extracted-data-page" style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {streamEvents.length > 0 && (
                <div className="stream-panel">
                  <div className="stream-panel-header">
                    <div>
                      <div className="stream-panel-title">Live progress</div>
                      <div className="stream-panel-subtitle">Streaming status from /api/analyze</div>
                    </div>
                    {isLoading && <div className="stream-panel-badge">Streaming</div>}
                  </div>
                  <div className="stream-event-list">
                    {streamEvents.map((event) => (
                      <div key={event.id} className={`stream-event stream-event-${event.type}`}>
                        <div className="stream-event-head">
                          <span className="stream-event-title">{event.title}</span>
                          {event.stage && <span className="stream-event-stage">{event.stage}</span>}
                        </div>
                        <div className="stream-event-message">{event.message}</div>
                        {(event.account || event.postNumber || event.link) && (
                          <div className="stream-event-meta">
                            {event.account && <span>{event.account}</span>}
                            {event.postNumber && <span>Post {event.postNumber}</span>}
                            {event.link && <span>{event.link}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isLoading ? (
                <div style={{ color: 'white', fontSize: '1.2rem', padding: '40px' }}>Loading analysis...</div>
              ) : error ? (
                <div style={{ color: '#ff6b6b', fontSize: '1.2rem', padding: '40px', textAlign: 'center' }}>
                  {error}
                </div>
              ) : analysisData && analysisData.analysis ? (
                <>
                  <ClassificationPerformanceChart 
                    title="Intent Performance" 
                    data={Object.entries(analysisData.analysis.global_insights?.intent_insights || {}).map(([name, data]) => ({
                      name,
                      winRate: parseFloat(data.account_relative_win_rate?.likes || 0),
                      avgRelativeLikes: parseFloat(data.global_relative_performance_average?.likes || 0),
                      medianRelativeLikes: parseFloat(data.global_relative_performance_median?.likes || 0),
                      avgRelativeComments: parseFloat(data.global_relative_performance_average?.comments || 0)
                    }))} 
                  />
                  <ClassificationPerformanceChart 
                    title="Format Performance" 
                    data={Object.entries(analysisData.analysis.global_insights?.format_insights || {}).map(([name, data]) => ({
                      name,
                      winRate: parseFloat(data.account_relative_win_rate?.likes || 0),
                      avgRelativeLikes: parseFloat(data.global_relative_performance_average?.likes || 0),
                      medianRelativeLikes: parseFloat(data.global_relative_performance_median?.likes || 0),
                      avgRelativeComments: parseFloat(data.global_relative_performance_average?.comments || 0)
                    }))} 
                  />
                  <TopPerformer account={analysisData.analysis.additional_insights?.topPerformer?.account} frequency={analysisData.analysis.additional_insights?.topPerformer?.frequency} />
                  <ContentTypePerformance reelsPerformance={analysisData.analysis.additional_insights?.reelsPerformanceOverPosts} />
                  <AiOverview aiOverviewData={analysisData.aiOverview} excelPath={analysisData.excelPath} />
                </>
              ) : (
                <div style={{ color: '#8c8c8c', fontSize: '1.2rem', padding: '40px', textAlign: 'center' }}>
                  Run an analysis to view extracted data.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeDetails;
