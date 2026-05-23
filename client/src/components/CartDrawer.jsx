import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeItem,
  updateQuantity,
  clearCart,
  checkoutCart,
  resetCheckoutStatus,
  refreshItemVersions,
} from '../store/cartSlice';
import { fetchAllPlants } from '../store/plantsSlice';

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const { items, checkoutStatus, checkoutError, lastOrder } = useSelector(
    (state) => state.cart
  );
  const plants = useSelector((state) => state.plants.plants);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // When OCC conflict occurs, refresh item versions from latest plants
  useEffect(() => {
    if (checkoutStatus === 'conflict' && plants.length > 0) {
      dispatch(refreshItemVersions(plants));
    }
  }, [checkoutStatus, plants, dispatch]);

  const handleCheckout = () => {
    if (!address.trim()) {
      setAddressError('Please enter a delivery address');
      return;
    }
    setAddressError('');
    dispatch(checkoutCart(address));
  };

  const handleClose = () => {
    if (checkoutStatus === 'success') {
      dispatch(clearCart());
      setAddress('');
      setAddressError('');
    }
    dispatch(resetCheckoutStatus());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h2>🛒 Your Cart</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* ── Success State ───────────────────────────────────────────── */}
        {checkoutStatus === 'success' && (
          <div className="checkout-success">
            <div className="success-icon">🎉</div>
            <h3>Order Placed!</h3>
            <p>Thank you for your purchase. Your plants are on their way!</p>
            <button className="btn-primary" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        )}

        {/* ── Conflict Warning ────────────────────────────────────────── */}
        {checkoutStatus === 'conflict' && (
          <div className="conflict-banner">
            ⚠️ <strong>Some plants were updated by the seller.</strong> Cart versions refreshed — please review and try again.
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────── */}
        {checkoutStatus === 'error' && (
          <div className="error-banner">❌ {checkoutError}</div>
        )}

        {checkoutStatus !== 'success' && (
          <>
            {items.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon">🌿</span>
                <p>Your cart is empty</p>
                <button className="btn-secondary" onClick={handleClose}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item._id} className="cart-drawer-item">
                      <img src={item.image} alt={item.name} className="cart-item-thumb" />
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">${item.price}</span>
                      </div>
                      <div className="cart-qty-controls">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              dispatch(updateQuantity({ _id: item._id, quantity: item.quantity - 1 }));
                            } else {
                              dispatch(removeItem(item._id));
                            }
                          }}
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(updateQuantity({ _id: item._id, quantity: item.quantity + 1 }))
                          }
                        >+</button>
                      </div>
                      <span className="cart-item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        className="cart-item-remove"
                        onClick={() => dispatch(removeItem(item._id))}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-address-input" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text3)' }}>Shipping Address</label>
                    <textarea 
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if(addressError) setAddressError('');
                      }}
                      placeholder="Enter full delivery address..."
                      style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', background: 'var(--bg2)', border: `1px solid ${addressError ? 'var(--red)' : 'var(--border2)'}`, color: 'var(--text)', fontSize: '0.85rem', resize: 'vertical', minHeight: '60px' }}
                    />
                    {addressError && <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>{addressError}</span>}
                  </div>
                  
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                  <button
                    className="btn-primary checkout-btn"
                    onClick={handleCheckout}
                    disabled={checkoutStatus === 'loading'}
                  >
                    {checkoutStatus === 'loading' ? 'Processing...' : '✅ Checkout'}
                  </button>
                  <button className="btn-secondary" onClick={handleClose}>
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
