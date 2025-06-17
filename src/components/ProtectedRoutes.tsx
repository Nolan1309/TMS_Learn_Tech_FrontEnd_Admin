import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Route that requires authentication as admin or teacher
export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isTeacher, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Only allow admin or teacher to access the application
  return isAuthenticated && (isAdmin || isTeacher) ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Route that is only accessible for admins
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Route that is only accessible for teachers and admins
export const TeacherRoute: React.FC = () => {
  const { isAuthenticated, isTeacher, isAdmin, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow either teachers or admins to access teacher routes
  return isAuthenticated && (isTeacher || isAdmin) ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Route that is only accessible for regular users
export const UserRoute: React.FC = () => {
  const { isAuthenticated, isUser, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isUser ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Route that is only accessible for VIP users
export const VipUserRoute: React.FC = () => {
  const { isAuthenticated, isUserVip, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isUserVip ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Route that is only accessible for HUIT students
export const HuitStudentRoute: React.FC = () => {
  const { isAuthenticated, isHuitStudent, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isHuitStudent ? <Outlet /> : <Navigate to="/unauthorized" />;
}; 