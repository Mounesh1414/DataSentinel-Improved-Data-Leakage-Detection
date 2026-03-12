import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axiosInstance from '../utils/axiosInstance';
import '../styles/admin.css';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await axiosInstance.get('/admin/stats');
      const usersRes = await axiosInstance.get('/admin/users');
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}`, {
        isActive: !currentStatus,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-panel">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>System Management & Configuration</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="admin-content">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats?.totalUsers || 0}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Active Users</h3>
                <p className="stat-value">{stats?.activeUsers || 0}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Total Scans</h3>
                <p className="stat-value">{stats?.totalScans || 0}</p>
              </div>
              <div className="admin-stat-card critical">
                <h3>Critical Scans</h3>
                <p className="stat-value">{stats?.criticalScans || 0}</p>
              </div>
              <div className="admin-stat-card alert">
                <h3>Open Alerts</h3>
                <p className="stat-value">{stats?.openAlerts || 0}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Total Alerts</h3>
                <p className="stat-value">{stats?.totalAlerts || 0}</p>
              </div>
            </div>

            {stats?.recentAlerts && (
              <div className="recent-alerts-section">
                <h2>Recent Alerts</h2>
                <div className="alerts-list">
                  {stats.recentAlerts.map((alert) => (
                    <div key={alert._id} className="alert-item">
                      <div>
                        <h4>{alert.title}</h4>
                        <p>{alert.description}</p>
                      </div>
                      <span className={`severity-badge ${alert.severity}`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </td>
                      <td>{user.department || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleUser(user._id, user.isActive)}
                          className="action-btn"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="action-btn delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
