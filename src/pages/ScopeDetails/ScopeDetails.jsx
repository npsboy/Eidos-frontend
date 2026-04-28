import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Link as LinkIcon, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ClassificationPerformanceChart from '../../components/ClassificationPerformanceChart/ClassificationPerformanceChart';
import IndividualAccountInsights from '../../components/IndividualAccountInsights/IndividualAccountInsights';
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

const linkPattern = /(https?:\/\/[^\s]+)/g;

const renderMessageWithLinks = (message) => {
  if (!message) return null;

  const chunks = message.split(linkPattern);
  return chunks.map((chunk, index) => {
    if (chunk.match(linkPattern)) {
      return (
        <a
          key={`${chunk}-${index}`}
          href={chunk}
          target="_blank"
          rel="noopener noreferrer"
          className="stream-link"
        >
          {chunk}
        </a>
      );
    }

    return <React.Fragment key={`${chunk}-${index}`}>{chunk}</React.Fragment>;
  });
};

const formatDateTime = (isoDate) => {
  if (!isoDate) return 'N/A';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
};

const deriveRunSummary = (payload = {}) => {
  const rawData = payload.rawData;
  let postsCount = 0;
  let accountNames = [];

  if (Array.isArray(rawData)) {
    postsCount = rawData.length;
    accountNames = rawData
      .map((item) => item?.account || item?.accountName || item?.username)
      .filter(Boolean);
  } else if (rawData && typeof rawData === 'object') {
    const entries = Object.entries(rawData);
    accountNames = entries.map(([account]) => account).filter(Boolean);
    postsCount = entries.reduce((total, [, value]) => {
      if (Array.isArray(value)) return total + value.length;
      if (value && typeof value === 'object' && Array.isArray(value.posts)) return total + value.posts.length;
      return total;
    }, 0);
  }

  if (accountNames.length === 0 && Array.isArray(payload.accounts)) {
    accountNames = payload.accounts.filter(Boolean);
  }

  const accountCount = new Set(accountNames).size;
  return {
    postsCount,
    accountCount
  };
};

const getExtractedDataStorageKey = (scopeId) => `eidos_scope_extracted_data_${scopeId}`;

const ScopeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const latestRunSummaryRef = useRef({ postsCount: 0, accountCount: 0 });
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
  const [streamEvent, setStreamEvent] = useState(null);
  const [lastRunAt, setLastRunAt] = useState(null);
  const [lastRunSummary, setLastRunSummary] = useState({ postsCount: 0, accountCount: 0 });

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
        if (foundScope.lastRunAt) setLastRunAt(foundScope.lastRunAt);
        setLastRunSummary({
          postsCount: Number(foundScope.lastRunPostsCount || 0),
          accountCount: Number(foundScope.lastRunAccountsCount || 0)
        });
        if (foundScope.intents) setIntents(foundScope.intents);
        if (foundScope.formats) setFormats(foundScope.formats);
        if (foundScope.additionalSettings) setAdditionalSettings(foundScope.additionalSettings);

        const savedExtractedDataRaw = localStorage.getItem(getExtractedDataStorageKey(id));
        if (savedExtractedDataRaw) {
          try {
            const savedExtractedData = JSON.parse(savedExtractedDataRaw);
            if (savedExtractedData?.data) {
              setAnalysisData(savedExtractedData.data);
            }
          } catch (parseError) {
            console.error('Failed to parse saved extracted data:', parseError);
          }
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

const updateLocalStorage = (newAccounts, newIntents, newFormats, newAdditionalSettings, runMeta) => {
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
              additionalSettings: newAdditionalSettings || additionalSettings,
              lastRunAt: runMeta?.lastRunAt || s.lastRunAt,
              lastRunPostsCount: runMeta?.postsCount ?? s.lastRunPostsCount,
              lastRunAccountsCount: runMeta?.accountCount ?? s.lastRunAccountsCount
            }
          : s
      );
      localStorage.setItem('eidos_scopes', JSON.stringify(updatedScopes));
    }
  };

  const persistLastRun = (runMeta) => {
    setLastRunAt(runMeta.lastRunAt);
    setLastRunSummary({
      postsCount: runMeta.postsCount,
      accountCount: runMeta.accountCount
    });
    setScope((currentScope) => {
      if (!currentScope) return currentScope;
      return {
        ...currentScope,
        lastRunAt: runMeta.lastRunAt,
        lastRunPostsCount: runMeta.postsCount,
        lastRunAccountsCount: runMeta.accountCount
      };
    });
    updateLocalStorage(null, null, null, null, runMeta);
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

  const persistExtractedData = (data) => {
    if (!id || !data) return;

    localStorage.setItem(
      getExtractedDataStorageKey(id),
      JSON.stringify({
        savedAt: new Date().toISOString(),
        data
      })
    );
  };

  const handleDownloadExtractedData = () => {
    if (!analysisData) return;

    setError(null);
    setActiveTab('data');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
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
    localStorage.removeItem(getExtractedDataStorageKey(id)); // Clear locally stored extracted data
    setError(null);
    setStreamEvent(null);
    latestRunSummaryRef.current = { postsCount: 0, accountCount: 0 };

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
            setStreamEvent({
              type: 'progress',
              stage: parsedData.stage,
              title: streamStageLabels[parsedData.stage] || parsedData.stage || 'Progress update',
              message: parsedData.message || 'Working...',
              account: parsedData.account,
              postNumber: parsedData.postNumber,
              link: parsedData.link
            });
            return;
          }

          if (eventName === 'final') {
            const summary = deriveRunSummary(parsedData);
            latestRunSummaryRef.current = summary;
            setAnalysisData(parsedData);
            persistExtractedData(parsedData);
            setStreamEvent({
              type: 'final',
              title: 'Analysis complete',
              message: `Full analysis payload received. Scraped ${summary.postsCount} posts from ${summary.accountCount} accounts.`
            });
          }

          if (eventName === 'done') {
            const completedAt = new Date().toISOString();
            const summary = latestRunSummaryRef.current;
            const runMeta = {
              lastRunAt: completedAt,
              postsCount: summary.postsCount,
              accountCount: summary.accountCount
            };

            persistLastRun(runMeta);
            setStreamEvent({
              type: 'done',
              title: 'Finished',
              message: `Finished at ${formatDateTime(completedAt)}. Scraped ${summary.postsCount} posts from ${summary.accountCount} accounts.`
            });
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
        persistExtractedData(data);
        const completedAt = new Date().toISOString();
        const summary = deriveRunSummary(data);
        persistLastRun({
          lastRunAt: completedAt,
          postsCount: summary.postsCount,
          accountCount: summary.accountCount
        });
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
            <div className="last-run">
              {lastRunAt
                ? `Last run: ${formatDateTime(lastRunAt)} • ${lastRunSummary.postsCount} posts from ${lastRunSummary.accountCount} accounts`
                : 'Last run: Not run yet'}
            </div>
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
              {streamEvent && (
                <div className="stream-panel">
                  <div className="stream-panel-header">
                    <div>
                      <div className="stream-panel-title">Live progress</div>
                      <div className="stream-panel-subtitle">Streaming status from /api/analyze</div>
                    </div>
                    {isLoading && <div className="stream-panel-badge">Streaming</div>}
                  </div>
                  <div className="stream-event-list">
                    <div className={`stream-event stream-event-${streamEvent.type}`}>
                      <div className="stream-event-head">
                        <span className="stream-event-title">{streamEvent.title}</span>
                        {streamEvent.stage && <span className="stream-event-stage">{streamEvent.stage}</span>}
                      </div>
                      <div className="stream-event-message">{renderMessageWithLinks(streamEvent.message)}</div>
                      {(streamEvent.account || streamEvent.postNumber || streamEvent.link) && (
                        <div className="stream-event-meta">
                          {streamEvent.account && <span>{streamEvent.account}</span>}
                          {streamEvent.postNumber && <span>Post {streamEvent.postNumber}</span>}
                          {streamEvent.link && (
                            <a
                              href={streamEvent.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="stream-link stream-meta-link"
                            >
                              Open post
                            </a>
                          )}
                        </div>
                      )}
                      </div>
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
                  <IndividualAccountInsights 
                    accounts={analysisData.accounts}
                    accountAnalysisData={analysisData.analysis.account_analysis}
                  />
                  <TopPerformer account={analysisData.analysis.additional_insights?.topPerformer?.account} frequency={analysisData.analysis.additional_insights?.topPerformer?.frequency} />
                  <ContentTypePerformance reelsPerformance={analysisData.analysis.additional_insights?.reelsPerformanceOverPosts} />
                  {analysisData.aiOverview && <AiOverview aiOverviewData={analysisData.aiOverview} excelPath={analysisData.excelPath} />}
                </>
              ) : (
                <div style={{ color: '#8c8c8c', fontSize: '1.2rem', padding: '40px', textAlign: 'center' }}>
                  Run an analysis to view extracted data.
                </div>
              )}
              {analysisData && (
                <div className="extracted-data-actions">
                  <button className="extracted-data-download-btn" onClick={handleDownloadExtractedData}>
                    Print extracted data report
                  </button>
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
