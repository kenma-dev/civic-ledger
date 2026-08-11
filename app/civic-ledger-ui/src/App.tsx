import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Layout/Header';
import LoginChooser from './components/LoginChooser';
import Landing from './pages/Landing';
import Charities from './pages/Charities';
import CampaignPage from './pages/CampaignPage';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import RunProof from './pages/RunProof';
import PrivateLedger from './pages/PrivateLedger';
import { useCivicLedger } from './contexts';

const AppInner: React.FC = () => {
  const { walletStatus } = useCivicLedger();
  return <Box sx={{ minHeight: '100vh' }}>
    {walletStatus !== 'connected' && <LoginChooser />}
    <Header />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/charities" element={<Charities />} />
      <Route path="/charity/:address" element={<CampaignPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/expenses" element={<Expenses />} />
      <Route path="/dashboard/proof" element={<RunProof />} />
      <Route path="/dashboard/ledger" element={<PrivateLedger />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Box>;
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
);

export default App;

