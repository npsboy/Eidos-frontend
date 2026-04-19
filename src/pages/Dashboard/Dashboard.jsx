import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const [scopes, setScopes] = useState(() => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    return savedScopes ? JSON.parse(savedScopes) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScopeName, setNewScopeName] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    localStorage.setItem('eidos_scopes', JSON.stringify(scopes));
  }, [scopes]);

  const handleCreateScope = () => {
    if (!newScopeName.trim()) return;
    
    const newScope = {
      id: Date.now().toString(),
      name: newScopeName,
      accounts: 'No accounts added',
      status: 'not-started',
      statusText: 'Not Started'
    };
    
    setScopes([...scopes, newScope]);
    setNewScopeName('');
    setIsModalOpen(false);
  };

  const handleDeleteScope = (id) => {
    setScopes(scopes.filter(scope => scope.id !== id));
    setActiveDropdown(null);
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'completed';
      case 'running': return 'running';
      default: return 'not-started';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Your scopes</h1>
        
        <table className="scopes-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>SCOPE NAME</th>
              <th style={{ width: '35%' }}>ACCOUNTS</th>
              <th style={{ width: '20%' }}>STATUS</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {scopes.map((scope) => (
              <tr key={scope.id}>
                <td>
                  <Link to={`/scopes/${scope.id}`} className="scope-link">{scope.name}</Link>
                </td>
                <td>{scope.accounts}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(scope.status)}`}>
                    {scope.statusText}
                  </span>
                </td>
                <td className="actions-cell" onClick={() => toggleDropdown(scope.id)}>
                  ...
                  {activeDropdown === scope.id && (
                    <div className="dropdown-menu">
                      <div 
                        className="dropdown-item" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScope(scope.id);
                        }}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="new-scope-btn" onClick={() => setIsModalOpen(true)}>
          + New Scope
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Scope</h2>
            <input 
              type="text" 
              className="modal-input"
              placeholder="Enter scope name..."
              value={newScopeName}
              onChange={(e) => setNewScopeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateScope()}
              autoFocus
            />
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => {
                  setIsModalOpen(false);
                  setNewScopeName('');
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn create" 
                onClick={handleCreateScope}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
