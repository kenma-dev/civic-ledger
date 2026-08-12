import React from 'react';
import { AppBar, Box, Button, Chip, Container, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import { useCivicLedger } from '../../contexts';

const NAV = [
  { label: 'Charities', path: '/charities' },
  { label: 'Dashboard', path: '/dashboard' },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { walletStatus, walletAddress, connectWallet, disconnectWallet } = useCivicLedger();
  const shortAddr = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: 84,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #1F5E52, #A46E43)',
                color: '#fff',
                boxShadow: '0 10px 24px rgba(31, 94, 82, 0.22)',
              }}
            >
              <ShieldIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 700, letterSpacing: '-0.04em' }}>
                Civic Ledger
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: '0.02em' }}>
                Private proof with public trust
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {NAV.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={location.pathname.startsWith(item.path) ? 'contained' : 'text'}
                sx={{ minWidth: 108 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {walletStatus === 'connected' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={shortAddr} sx={{ bgcolor: 'rgba(31, 94, 82, 0.12)', color: 'primary.main' }} />
              <Button variant="outlined" onClick={disconnectWallet}>Disconnect</Button>
            </Box>
          ) : (
            <Button variant="contained" onClick={connectWallet}>
              Connect wallet
            </Button>
          )}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Header;
export { Header };

