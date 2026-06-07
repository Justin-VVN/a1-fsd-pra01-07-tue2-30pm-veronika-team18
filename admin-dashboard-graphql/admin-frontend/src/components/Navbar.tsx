import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">⚡ VV Admin Dashboard</span>
      <div className="navbar-links">
        <NavLink to="/venues" className={({ isActive }) => (isActive ? 'active' : '')}>
          Venues
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
          Reports
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
          Notifications
        </NavLink>
      </div>
      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
