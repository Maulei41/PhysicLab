import React from 'react';
import { Navigate } from 'react-router-dom';
import { isStudentAuthenticated } from '../utils/cookieAuth';

export default function ProtectedRoute({ children }) {
  if (!isStudentAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
