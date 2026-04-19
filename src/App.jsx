import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import ScopeDetails from './pages/ScopeDetails/ScopeDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scopes/:id" element={<ScopeDetails />} />
      </Routes>
    </Router>
  )
}

export default App;
