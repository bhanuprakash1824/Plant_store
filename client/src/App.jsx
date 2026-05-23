import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConsumerShop from './pages/ConsumerShop';
import ConsumerOrders from './pages/ConsumerOrders';
import ProducerDashboard from './pages/ProducerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

import './index.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Consumer */}
            <Route
              path="/shop"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerShop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerOrders />
                </ProtectedRoute>
              }
            />

            {/* Producer — wildcard so sub-routes work */}
            <Route
              path="/producer/*"
              element={
                <ProtectedRoute allowedRoles={['producer']}>
                  <ProducerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Owner — wildcard so sub-routes work */}
            <Route
              path="/owner/*"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default: redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
