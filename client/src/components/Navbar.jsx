import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const totalQty = cartItems.reduce((t, i) => t + i.quantity, 0);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <nav className="navbar-main">
        <div className="navbar-brand">
          <img
            src="https://cdn.pixabay.com/photo/2020/08/05/13/12/eco-5465432_1280.png"
            alt="logo"
            className="navbar-logo"
          />
          <div>
            <h2 className="navbar-title">Paradise Nursery</h2>
            <span className="navbar-tagline">Where Green Meets Serenity</span>
          </div>
        </div>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {/* CONSUMER LINKS */}
          {user.role === 'consumer' && (
            <>
              <Link to="/shop" className="nav-link" onClick={() => setMenuOpen(false)}>
                🌿 Shop
              </Link>
              <Link to="/my-orders" className="nav-link" onClick={() => setMenuOpen(false)}>
                📦 My Orders
              </Link>
              <button
                className="nav-link cart-btn"
                onClick={() => { setCartOpen(true); setMenuOpen(false); }}
              >
                🛒 Cart
                {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
              </button>
            </>
          )}

          {/* PRODUCER LINKS */}
          {user.role === 'producer' && (
            <>
              <Link to="/producer" className="nav-link" onClick={() => setMenuOpen(false)}>
                🌱 My Plants
              </Link>
              <Link to="/producer/sales" className="nav-link" onClick={() => setMenuOpen(false)}>
                📊 My Sales
              </Link>
            </>
          )}

          {/* OWNER LINKS */}
          {user.role === 'owner' && (
            <>
              <Link to="/owner" className="nav-link" onClick={() => setMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/owner/users" className="nav-link" onClick={() => setMenuOpen(false)}>
                👥 Users
              </Link>
              <Link to="/owner/plants" className="nav-link" onClick={() => setMenuOpen(false)}>
                🌿 All Plants
              </Link>
              <Link to="/owner/orders" className="nav-link" onClick={() => setMenuOpen(false)}>
                🧾 All Orders
              </Link>
              <Link to="/owner/log" className="nav-link" onClick={() => setMenuOpen(false)}>
                📋 Audit Log
              </Link>
            </>
          )}

          <div className="nav-user-info">
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <span className="nav-username">{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {user.role === 'consumer' && (
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
