import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profitability from './pages/Profitability';
import ClientIntelligence from './pages/ClientIntelligence';
import FinancialDeepDive from './pages/FinancialDeepDive';
import Chat from './pages/Chat';
import DataManagement from './pages/DataManagement';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/profitability" element={<Layout><Profitability /></Layout>} />
      <Route path="/clients" element={<Layout><ClientIntelligence /></Layout>} />
      <Route path="/financial" element={<Layout><FinancialDeepDive /></Layout>} />
      <Route path="/chat" element={<Layout><Chat /></Layout>} />
      <Route path="/data" element={<Layout><DataManagement /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
