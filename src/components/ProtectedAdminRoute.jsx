import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/cookieAuth';

export default function ProtectedAdminRoute({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
