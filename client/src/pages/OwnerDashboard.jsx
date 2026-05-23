import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

// ── Stat Cards ────────────────────────────────────────────────────────────────
const StatsPage = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    axiosInstance.get('/admin/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="page-loading">Loading stats...</div>;

  const cards = [
    { icon: '💰', label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
    { icon: '🧾', label: 'Total Orders', value: stats.totalOrders },
    { icon: '🌿', label: 'Active Plants', value: stats.totalPlants },
    { icon: '👥', label: 'Total Users', value: stats.totalUsers },
    { icon: '🌱', label: 'Producers', value: stats.totalProducers },
    { icon: '🛍️', label: 'Consumers', value: stats.totalConsumers },
  ];

  return (
    <div className="dashboard-content">
      <h2 className="section-title">📊 Platform Overview</h2>
      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Users Table ───────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axiosInstance.get('/admin/users').then(({ data }) => setUsers(data));
  }, []);

  return (
    <div className="dashboard-content">
      <h2 className="section-title">👥 All Users ({users.length})</h2>
      <div className="orders-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Business</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td className="mono">{u.email}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td>{u.businessName || '—'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── All Plants Table ──────────────────────────────────────────────────────────
const AllPlantsPage = () => {
  const [plants, setPlants] = useState([]);
  useEffect(() => {
    axiosInstance.get('/admin/plants').then(({ data }) => setPlants(data));
  }, []);

  return (
    <div className="dashboard-content">
      <h2 className="section-title">🌿 All Plants ({plants.length})</h2>
      <div className="orders-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Producer</th><th>Active</th></tr>
          </thead>
          <tbody>
            {plants.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>{p.producer?.businessName || p.producer?.name || '—'}</td>
                <td>{p.isActive ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── All Orders Table ──────────────────────────────────────────────────────────
const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axiosInstance.get('/admin/orders').then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="dashboard-content">
      <h2 className="section-title">🧾 All Orders ({orders.length})</h2>
      <div className="orders-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Consumer</th><th>Items</th><th>Total</th><th>Date</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="mono">{o._id.slice(-8)}</td>
                <td>{o.consumer?.name || '—'}</td>
                <td>{o.items.map((i) => `${i.plantName} x${i.quantity}`).join(', ')}</td>
                <td>${o.totalAmount.toFixed(2)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Audit Log ─────────────────────────────────────────────────────────────────
const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    axiosInstance.get('/admin/transactions').then(({ data }) => setLogs(data));
  }, []);

  const typeColors = {
    purchase: '#22c55e',
    listing_add: '#3b82f6',
    listing_update: '#f59e0b',
    listing_delete: '#ef4444',
  };

  return (
    <div className="dashboard-content">
      <h2 className="section-title">📋 Audit Log</h2>
      <div className="audit-log">
        {logs.map((log) => (
          <div className="audit-entry" key={log._id}>
            <span className="audit-dot" style={{ background: typeColors[log.type] || '#888' }} />
            <div className="audit-body">
              <span className="audit-detail">{log.detail}</span>
              {log.amount && <span className="audit-amount">${log.amount.toFixed(2)}</span>}
            </div>
            <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="empty-state">No activity yet.</div>}
      </div>
    </div>
  );
};

// ── Owner Dashboard Shell ─────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/owner', label: '📊 Overview', exact: true },
    { to: '/owner/users', label: '👥 Users' },
    { to: '/owner/plants', label: '🌿 All Plants' },
    { to: '/owner/orders', label: '🧾 All Orders' },
    { to: '/owner/log', label: '📋 Audit Log' },
  ];

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h3 className="sidebar-title">Owner Panel</h3>
        {navLinks.map((l) => {
          const isActive = l.exact
            ? location.pathname === l.to
            : location.pathname.startsWith(l.to);
          return (
            <Link key={l.to} to={l.to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </Link>
          );
        })}
      </aside>
      <main className="owner-main">
        <Routes>
          <Route path="/" element={<StatsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/plants" element={<AllPlantsPage />} />
          <Route path="/orders" element={<AllOrdersPage />} />
          <Route path="/log" element={<AuditLogPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default OwnerDashboard;
