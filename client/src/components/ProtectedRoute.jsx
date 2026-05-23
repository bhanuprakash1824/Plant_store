import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard for their role
    if (user.role === 'producer') return <Navigate to="/producer" replace />;
    if (user.role === 'consumer') return <Navigate to="/shop" replace />;
    if (user.role === 'owner') return <Navigate to="/owner" replace />;
  }

  return children;
};

export default ProtectedRoute;
