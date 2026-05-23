import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';

const ROLE_TABS = [
  { value: 'consumer', label: '🛍️ Consumer', desc: 'Browse & buy plants' },
  { value: 'producer', label: '🌱 Producer', desc: 'Manage your listings' },
  { value: 'owner', label: '👑 Owner', desc: 'Platform dashboard' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState('consumer');
  const [form, setForm] = useState({ email: '', password: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'producer') navigate('/producer');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/shop');
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, role]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ ...form, role }));
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
          <h1>Paradise Nursery</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {ROLE_TABS.map((t) => (
            <button
              key={t.value}
              className={`role-tab ${role === t.value ? 'active' : ''}`}
              onClick={() => setRole(t.value)}
              type="button"
            >
              <span className="role-tab-label">{t.label}</span>
              <span className="role-tab-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="form-error">{error}</div>}

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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {role !== 'owner' && (
          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" state={{ role }}>
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
