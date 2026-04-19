import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, BarChart2, Link as LinkIcon, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './ScopeDetails.css';

const ScopeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scope, setScope] = useState(null);
  const [accounts, setAccounts] = useState(['Nike', 'Plaeto.shoes']);

  useEffect(() => {
    const savedScopes = localStorage.getItem('eidos_scopes');
    if (savedScopes) {
      const parsedScopes = JSON.parse(savedScopes);
      const foundScope = parsedScopes.find(s => s.id === id);
      if (foundScope) {
        setScope(foundScope);
        // Load actual accounts if you have them in the future
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

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
          <button className="tab active">
            <Settings className="tab-icon" />
            Scope Settings
          </button>
          <button className="tab">
            <BarChart2 className="tab-icon" />
            Extracted Data
          </button>
        </div>

        <div className="scope-body">
          <div className="accounts-section">
            <h2>Accounts</h2>
            <div className="accounts-list">
              {accounts.map((account, index) => (
                <div key={index} className="account-item">
                  <div className="account-info">
                    <LinkIcon className="link-icon" />
                    {account}
                  </div>
                  <button className="delete-account-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-account-btn">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeDetails;