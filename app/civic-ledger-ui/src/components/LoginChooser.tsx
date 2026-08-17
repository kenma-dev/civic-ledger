import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useCivicLedger } from '../contexts';

const LoginChooser: React.FC = () => {
  const { connectWallet, walletStatus } = useCivicLedger();
  const [message, setMessage] = useState<string | null>(null);
  const connect = async () => {
    setMessage(null);
    try { await connectWallet(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Wallet connection failed'); }
  };
  return <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'grid', placeItems: 'center', p: 2, bgcolor: 'rgba(15,18,28,.56)', backdropFilter: 'blur(18px)' }}>
    <Card sx={{ width: 'min(600px, 100%)' }}><CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <VerifiedIcon sx={{ color: 'primary.main', fontSize: 34, mb: 1 }} />
      <Typography variant="h4" sx={{ mb: 1 }}>Connect to CivicLedger</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>Use Lace, 1AM, or another Midnight-compatible wallet. App connects to deployed contract on Midnight Preprod.</Typography>
      {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
      <Button variant="contained" fullWidth onClick={connect} disabled={walletStatus === 'connecting'} startIcon={walletStatus === 'connecting' ? <CircularProgress size={16} /> : <AccountBalanceWalletIcon />} sx={{ py: 1.4 }}>
        {walletStatus === 'connecting' ? 'Connecting…' : 'Connect Midnight wallet'}
      </Button>
    </CardContent></Card>
  </Box>;
};

export default LoginChooser;
