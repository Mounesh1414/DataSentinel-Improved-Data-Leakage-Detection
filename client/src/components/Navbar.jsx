import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          DataSentinel
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/scanner" className="nav-link">Scanner</Link>
          <Link to="/alerts" className="nav-link">Alerts</Link>
          <Link to="/logs" className="nav-link">Logs</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
