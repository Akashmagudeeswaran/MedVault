import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Determine redirect login path based on allowedRoles
    if (allowedRoles.includes('ROLE_ADMIN')) {
      return <Navigate to="/admin/login" replace />;
    } else if (allowedRoles.includes('ROLE_DOCTOR')) {
      return <Navigate to="/doctor/login" replace />;
    } else {
      return <Navigate to="/patient/login" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role mismatch: redirect to user's authorized home dashboard
    if (role === 'ROLE_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'ROLE_DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (role === 'ROLE_PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/patient/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
