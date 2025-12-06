import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import TeamManager from './pages/admin/TeamManager';
import VehicleManager from './pages/admin/VehicleManager';
import NewsManager from './pages/admin/NewsManager';
import RacesManager from './pages/admin/RacesManager';
import ActivitiesManager from './pages/admin/ActivitiesManager';
import SponsorsManager from './pages/admin/SponsorsManager';
import MessagesManager from './pages/admin/MessagesManager';
import SettingsManager from './pages/admin/SettingsManager';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/haber/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="team" element={<TeamManager />} />
              <Route path="vehicles" element={<VehicleManager />} />
              <Route path="races" element={<RacesManager />} />
              <Route path="activities" element={<ActivitiesManager />} />
              <Route path="sponsors" element={<SponsorsManager />} />
              <Route path="news" element={<NewsManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
