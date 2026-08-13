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
              )}

              {loading ? (
                <Card><CardContent sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></CardContent></Card>
              ) : state ? (
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3 }}>Spend profile</Typography>
                    {state.totalSpend > 0n ? (
                      <>
                        <SpendBar directAidPct={state.directAidPct} adminPct={state.adminPct} height={12} />
                        <Box sx={{ mt: 3 }}>
                          <StatRow label="Total spend committed" value={`${state.totalSpend.toLocaleString()} units`} />
                          <StatRow label="Direct aid" value={`${state.directAidPct}%`} />
                          <StatRow label="Admin" value={`${state.adminPct}%`} />
                          <StatRow label="Expenses committed" value={state.expenseSequence} />
                          <StatRow label="Restricted funds" value={state.isVerified ? 'Compliant' : 'Proof pending'} />
                          <StatRow label="Beneficiary data" value="Private" />
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No expenses committed yet.</Typography>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="warning">Could not load contract state.</Alert>
              )}

              {!loading && state?.isVerified && (
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>On-chain proof record</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
                      {[
                        { label: 'Direct aid proven', value: `${state.directAidPct}%` },
                        { label: 'Admin proven', value: `${state.adminPct}%` },
                        { label: 'Commitments verified', value: `${state.expenseSequence}` },
                        { label: 'Threshold', value: `>= ${state.directAidThreshold}%` },
                      ].map(({ label, value }) => (
                        <Box key={label} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(31, 94, 82, 0.04)' }}>
                          <Typography variant="caption">{label}</Typography>
                          <Typography variant="h6" sx={{ mt: 0.5 }}>{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      The chain verified the public result without revealing the private expense trail.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    onClick={() => setExplainerOpen((open) => !open)}
                    sx={{ px: 3, py: 2.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>What is a zero-knowledge proof?</Typography>
                    <ExpandMoreIcon sx={{ transform: explainerOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </Box>
                  <Collapse in={explainerOpen}>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Typography variant="body2">
                        A zero-knowledge proof shows the result is true while keeping the private evidence hidden.
                        Here, donors can verify the campaign stayed within its thresholds without seeing any recipient or supplier data.
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 88 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>Donate</Typography>
                <Typography variant="body2" sx={{ mb: 2.5 }}>
                  Lock shielded NIGHT into the campaign with a restriction attached.
                </Typography>

                {state?.potHasCoin && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 3, bgcolor: 'rgba(31, 94, 82, 0.06)' }}>
                    <Typography variant="caption">Pot balance</Typography>
                    <Typography variant="h6">{state.potValue.toLocaleString()} units</Typography>
                  </Box>
                )}

                {donationLogged && <Alert severity="success" sx={{ mb: 2 }}>Donation locked on-chain.</Alert>}
                {(donationError || error) && <Alert severity="error" sx={{ mb: 2 }}>{donationError ?? error}</Alert>}

                <TextField
                  label="Amount"
                  type="number"
                  fullWidth
                  size="small"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Restriction</Typography>
                <RadioGroup value={restriction} onChange={(e) => setRestriction(e.target.value as typeof restriction)}>
                  {[
                    { value: 'unrestricted', label: 'Unrestricted' },
                    { value: 'food', label: 'Food aid only' },
                    { value: 'medical', label: 'Medical only' },
                    { value: 'housing', label: 'Housing only' },
                  ].map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.label}
                    />
                  ))}
                </RadioGroup>

                {walletStatus === 'connected' ? (
                  <Button variant="contained" fullWidth sx={{ mt: 3 }} disabled={!donationAmount || txPending} onClick={handleDonate}>
                    {txPending ? 'Processing...' : 'Donate'}
                  </Button>
                ) : (
                  <Button variant="outlined" fullWidth sx={{ mt: 3 }} onClick={connectWallet}>
                    Connect wallet to donate
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CampaignPage;

