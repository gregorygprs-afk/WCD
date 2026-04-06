import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Volunteers from './pages/Volunteers';
import OrdemDoDia from './pages/OrdemDoDia';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { appUser, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!appUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { appUser, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <Routes>
      <Route path="/login" element={appUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="od" element={<OrdemDoDia />} />
        <Route path="logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
