import React from 'react';
import { Box, Button, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useCivicLedger } from '../contexts';
import CharityCard from '../components/CharityCard';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { charities } = useCivicLedger();
  const preview = charities.slice(0, 3);

  return (
    <Box>
      <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Chip label="Private giving infrastructure" color="secondary" sx={{ width: 'fit-content' }} />
                <Typography variant="h1">
                  Proof that money was used right.
                  <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
                    No ledger leaks.
                  </Box>
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 640, color: 'text.secondary', fontSize: '1.08rem' }}>
                  Civic Ledger lets charities commit private expenses, run zero-knowledge compliance proofs,
                  and show donors a public result without exposing beneficiaries, suppliers, or payment trails.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" size="large" onClick={() => navigate('/charities')}>
                    Explore campaigns
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    See the flow
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  {[
                    { label: 'Private expense commits', value: 'On chain' },
                    { label: 'Public proof result', value: 'Readable' },
                    { label: 'Beneficiary data', value: 'Hidden' },
                  ].map((item) => (
                    <Box key={item.label} sx={{ minWidth: 170, p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(23, 32, 51, 0.08)' }}>
                      <Typography variant="caption">{item.label}</Typography>
                      <Typography variant="h6" sx={{ mt: 0.5 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 6,
                  border: '1px solid rgba(23, 32, 51, 0.08)',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  boxShadow: '0 20px 50px rgba(23, 32, 51, 0.08)',
                }}
              >
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  Trust summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <LockIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Private by default</Typography>
                      <Typography variant="body2">Expense detail stays in the charity's private state.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <VerifiedIcon color="secondary" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Verifiable on demand</Typography>
                      <Typography variant="body2">Anyone can check the proof result without seeing raw data.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <VisibilityOffIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No exposure tax</Typography>
                      <Typography variant="body2">Sensitive records never need to be published to prove compliance.</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {preview.length > 0 && (
        <Box sx={{ py: 6 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h3">Active campaigns</Typography>
                <Typography variant="body2">A few live examples from the registry.</Typography>
              </Box>
              <Button onClick={() => navigate('/charities')}>View all</Button>
            </Box>
