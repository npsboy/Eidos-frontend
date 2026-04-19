import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, BarChart2, Link as LinkIcon, Trash2, ChevronDown, ChevronUp, Edit2, Plus } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ClassificationPerformanceChart, { intentDummyData, formatDummyData } from '../../components/ClassificationPerformanceChart/ClassificationPerformanceChart';
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

const ScopeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scope, setScope] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [accounts, setAccounts] = useState([]);
  
  const [intents, setIntents] = useState(defaultIntents);
  const [formats, setFormats] = useState(defaultFormats);
  
  const [intentExpanded, setIntentExpanded] = useState(false);
  const [formatExpanded, setFormatExpanded] = useState(false);
  
  const [intentEditing, setIntentEditing] = useState(false);
  const [formatEditing, setFormatEditing] = useState(false);

  const [additionalSettings, setAdditionalSettings] = useState({
    aiOverview: true,
    postingTimes: true,
    topPerformerInsights: true
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
                </div>
              </div>

              <div className="run-btn-container">
                <button className="run-btn">Run</button>
              </div>
            </>
          ) : (
            <div className="extracted-data-page" style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <ClassificationPerformanceChart title="Intent Performance" data={intentDummyData} />
              <ClassificationPerformanceChart title="Format Performance" data={formatDummyData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeDetails;
