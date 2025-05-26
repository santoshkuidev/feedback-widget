import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import Settings from './pages/Settings';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="feedback" element={<FeedbackList />} />
        <Route path="feedback/:id" element={<FeedbackDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
