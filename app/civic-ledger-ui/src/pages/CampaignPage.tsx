import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCivicLedger } from '../contexts';
import { type DeployedCivicLedgerAPI, type CivicLedgerState } from '../../../api/src/index.js';
import ProofBadge from '../components/ProofBadge';
import SpendBar from '../components/SpendBar';

const StatRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.1, borderBottom: '1px solid rgba(23, 32, 51, 0.08)' }}>
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
  </Box>
);

const CampaignPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { charities, joinCharity, walletStatus, connectWallet, donorDeposit, txPending, error } = useCivicLedger();

  const charity = charities.find((c) => c.contractAddress === address);
  const [api, setApi] = useState<DeployedCivicLedgerAPI | null>(null);
  const [state, setState] = useState<CivicLedgerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [restriction, setRestriction] = useState<'unrestricted' | 'food' | 'medical' | 'housing'>('unrestricted');
  const [donationLogged, setDonationLogged] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let sub: { unsubscribe(): void } | null = null;
    joinCharity(address)
      .then((a) => {
        setApi(a);
        sub = a.state$.subscribe((snapshot) => {
          setState(snapshot);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));

    return () => sub?.unsubscribe();
  }, [address, joinCharity]);

  const handleDonate = async () => {
    if (!donationAmount || !address) return;
    setDonationError(null);
    try {
      await donorDeposit(address, BigInt(Math.round(Number(donationAmount))), { unrestricted: 0, food: 1, medical: 2, housing: 3 }[restriction]);
      setDonationLogged(true);
      setDonationAmount('');
      setTimeout(() => setDonationLogged(false), 3500);
    } catch (e) {
      setDonationError(e instanceof Error ? e.message : 'Donation failed');
    }
  };

  if (!charity) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Campaign not found</Typography>
        <Button onClick={() => navigate('/charities')}>Back to campaigns</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Button onClick={() => navigate('/charities')} sx={{ mb: 3, pl: 0 }}>
          Back to campaigns
        </Button>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
                  <Typography variant="h3">{charity.name}</Typography>
                  {!loading && state && <ProofBadge verified={state.isVerified} size="medium" />}
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>{charity.category}</Typography>
              </Box>

              {charity.description && (
                <Typography variant="body1" sx={{ maxWidth: 760 }}>{charity.description}</Typography>
