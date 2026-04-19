import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, BarChart2, Link as LinkIcon, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './ScopeDetails.css';

const ScopeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scope, setScope] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    if (savedScopes) {
      const parsedScopes = JSON.parse(savedScopes);
      const foundScope = parsedScopes.find(s => s.id === id);
      if (foundScope) {
        setScope(foundScope);
        if (foundScope.accountList) {
          setAccounts(foundScope.accountList);
        } else {
          setAccounts([]);
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const updateLocalStorage = (newAccounts) => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    if (savedScopes) {
      const parsedScopes = JSON.parse(savedScopes);
      const updatedScopes = parsedScopes.map(s => 
        s.id === id 
          ? { ...s, accountList: newAccounts, accounts: newAccounts.length > 0 ? newAccounts.map(a => a.name).join(', ') : 'No accounts added' } 
          : s
      );
      localStorage.setItem('eidos_scopes', JSON.stringify(updatedScopes));
    }
  };

  const handleAddAccount = () => {
    const newAccount = { id: Date.now().toString(), name: '', isEditing: true };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts);
  };

  const handleDeleteAccount = (accountId) => {
    const newAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts);
  };

  const handleNameChange = (accountId, newName) => {
    const newAccounts = accounts.map(a => a.id === accountId ? { ...a, name: newName } : a);
    setAccounts(newAccounts);
  };

  const finishEditing = (accountId) => {
    const newAccounts = accounts.map(a => a.id === accountId ? { ...a, isEditing: false } : a);
    setAccounts(newAccounts);
    updateLocalStorage(newAccounts);
  };

  const handleKeyDown = (e, accountId) => {
    if (e.key === 'Enter') {
      finishEditing(accountId);
    }
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
          <div style={{ width: '60px' }}></div> {/* Spacer to align with content */}
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
            <BarChart2 className="tab-icon" />
            Extracted Data
          </button>
        </div>

        <div className="scope-body">
          {activeTab === 'settings' ? (
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
                          onChange={(e) => handleNameChange(account.id, e.target.value)}
                          onBlur={() => finishEditing(account.id)}
                          onKeyDown={(e) => handleKeyDown(e, account.id)}
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
          ) : (
            <div className="blank-page">
              {/* Blank page for Extracted Data */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeDetails;
