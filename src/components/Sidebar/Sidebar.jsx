import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/images/Eidos_Logo.png" alt="Eidos Logo" />
        <span className="sidebar-brand-name">Eidos</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/account" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>Account</NavLink>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>Dashboard</NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>Settings</NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>Projects</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;