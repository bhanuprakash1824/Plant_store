import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser, clearError } from '../store/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: location.state?.role || 'consumer',
    businessName: '',
    phone: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'producer') navigate('/producer');
      else navigate('/shop');
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const { confirmPassword, ...payload } = form;
    dispatch(registerUser(payload));
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">
          <img
            src="https://cdn.pixabay.com/photo/2020/08/05/13/12/eco-5465432_1280.png"
            alt="logo"
            className="auth-logo"
          />
          <h1>Create Account</h1>
          <p>Join Paradise Nursery today</p>
        </div>

        {/* Role selector */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${form.role === 'consumer' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'consumer' })}
          >
            <span className="role-tab-label">🛍️ Consumer</span>
            <span className="role-tab-desc">Browse & buy plants</span>
          </button>
          <button
            type="button"
            className={`role-tab ${form.role === 'producer' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'producer' })}
          >
            <span className="role-tab-label">🌱 Producer</span>
            <span className="role-tab-desc">Sell your plants</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || localError) && (
            <div className="form-error">{localError || error}</div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          {form.role === 'producer' && (
            <>
              <div className="form-group">
                <label>Business / Farm Name</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Green Thumb Farms"
                />
              </div>
              <div className="form-group">
                <label>Phone Number <span style={{color:'var(--primary)'}}>*</span></label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading
              ? 'Creating Account...'
              : `Register as ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
