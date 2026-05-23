import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyPlants, deletePlant } from '../store/plantsSlice';
import PlantCard from '../components/PlantCard';
import AddPlantModal from '../components/AddPlantModal';
import axiosInstance from '../api/axiosInstance';

// ── Sales sub-page ────────────────────────────────────────────────────────────
const ProducerSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    axiosInstance.get('/admin/orders').catch(() => {}).then(() => {});
    // Fetch producer's own sales via admin orders endpoint filtered client-side
    axiosInstance.get('/admin/orders')
      .then(({ data }) => {
        // Filter orders that contain at least one plant by this producer
        const mine = data.filter((order) =>
          order.items.some((i) => i.producerId === user._id || String(i.producerId) === String(user._id))
        );
        setOrders(mine);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user._id]);

  const myRevenue = orders.reduce((sum, o) => {
    const myItems = o.items.filter(
      (i) => String(i.producerId) === String(user._id)
    );
    return sum + myItems.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
  }, 0);

  if (loading) return <div className="page-loading">Loading sales...</div>;

  return (
    <div className="dashboard-content">
      <h2 className="section-title">📊 My Sales</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🧾</span>
          <span className="stat-value">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">${myRevenue.toFixed(2)}</span>
          <span className="stat-label">Revenue</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">No sales yet. Keep your plants listed!</div>
      ) : (
        <div className="orders-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Plants</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="mono">{order._id.slice(-6)}</td>
                  <td>{order.consumer?.name || '—'}</td>
                  <td>
                    {order.items
                      .filter((i) => String(i.producerId) === String(user._id))
                      .map((i) => `${i.plantName} x${i.quantity}`)
                      .join(', ')}
                  </td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main Plants sub-page ──────────────────────────────────────────────────────
const ProducerPlants = () => {
  const dispatch = useDispatch();
  const { plants, isLoading } = useSelector((s) => s.plants);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);

  useEffect(() => {
    dispatch(fetchMyPlants());
  }, [dispatch]);

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this plant from listings?')) {
      dispatch(deletePlant(id));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPlant(null);
  };

  return (
    <div className="dashboard-content">
      <div className="section-header">
        <h2 className="section-title">🌱 My Plant Listings</h2>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Add New Plant
        </button>
      </div>

      {isLoading ? (
        <div className="page-loading">Loading plants...</div>
      ) : plants.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <p>No plants listed yet.</p>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            Add Your First Plant
          </button>
        </div>
      ) : (
        <div className="plants-grid">
          {plants.map((plant) => (
            <PlantCard
              key={plant._id}
              plant={plant}
              mode="producer"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddPlantModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingPlant={editingPlant}
      />
    </div>
  );
};

// ── Producer Dashboard wrapper ────────────────────────────────────────────────
const ProducerDashboard = () => {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.name}! 🌿</h1>
        <p>{user?.businessName ? `${user.businessName} — ` : ''}Manage your plant listings and track your sales.</p>
      </div>
      <Routes>
        <Route path="/" element={<ProducerPlants />} />
        <Route path="/sales" element={<ProducerSales />} />
      </Routes>
    </div>
  );
};

export default ProducerDashboard;
