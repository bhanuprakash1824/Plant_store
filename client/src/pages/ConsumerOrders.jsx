import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

const ConsumerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get('/orders/mine');
        setOrders(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history');
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div className="page-loading">Loading your orders...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="orders-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>📦 My Orders</h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>View your past purchases and shipping details.</p>
        </div>
        <Link to="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--bg2)', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
          <h2>You haven't placed any orders yet!</h2>
          <p style={{ color: 'var(--text2)' }}>Start browsing our massive collection of plants.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>ORDER PLACED</span>
                  <div style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>TOTAL</span>
                  <div style={{ fontWeight: 600 }}>${order.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>SHIP TO</span>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{order.shippingAddress}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>ORDER #</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{order._id}</div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img 
                      src={item.plantImage || item.plant?.image || 'https://via.placeholder.com/150'} 
                      alt={item.plantName}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{item.plantName}</h4>
                      <p style={{ margin: 0, color: 'var(--text2)', fontSize: '0.9rem' }}>
                        Qty: {item.quantity}  ×  ${item.priceAtPurchase.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerOrders;
