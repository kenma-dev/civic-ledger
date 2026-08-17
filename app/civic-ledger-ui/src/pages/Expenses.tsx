import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import { useCivicLedger } from '../contexts';

type Category = { value: string; label: string; isDirectAid: boolean; isAdmin: boolean };

const CATEGORIES: Category[] = [
  { value: 'food', label: 'Food aid', isDirectAid: true, isAdmin: false },
  { value: 'medical', label: 'Medical', isDirectAid: true, isAdmin: false },
  { value: 'housing', label: 'Housing', isDirectAid: true, isAdmin: false },
  { value: 'logistics', label: 'Logistics', isDirectAid: false, isAdmin: false },
  { value: 'admin', label: 'Admin', isDirectAid: false, isAdmin: true },
];

type LoggedExpense = { id: string; label: string; timestamp: string };

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { commitExpense, txPending, error, isCharityOwner } = useCivicLedger();
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<Category | null>(null);
  const [history, setHistory] = useState<LoggedExpense[]>([]);
  const [success, setSuccess] = useState(false);

  if (!isCharityOwner) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Access restricted</Typography>
        <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
      </Container>
    );
  }

  const handleSubmit = async () => {
    if (!amount || !selected) return;
    setSuccess(false);
    try {
      await commitExpense(BigInt(Math.round(Number(amount))), selected.isDirectAid, selected.isAdmin, selected.label);
      setHistory((prev) => [
        { id: `E-${String(prev.length + 1).padStart(3, '0')}`, label: selected.label, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      setAmount('');
      setSelected(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // context already reports errors
    }
  };

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Button onClick={() => navigate('/dashboard')} sx={{ mb: 3, pl: 0 }}>
          Back to dashboard
        </Button>
        <Typography variant="h2" sx={{ mb: 1 }}>Log a private expense</Typography>
        <Typography variant="body2" sx={{ mb: 4, maxWidth: 720 }}>
          Amount and category stay private. Only the aggregate totals and proof-ready state update publicly.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField label="Amount" type="number" fullWidth size="small" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Category</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CATEGORIES.map((cat) => (
                      <Chip
                        key={cat.value}
                        label={cat.label}
                        clickable
                        onClick={() => setSelected(cat)}
                        color={selected?.value === cat.value ? 'primary' : 'default'}
                        variant={selected?.value === cat.value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: 3, bgcolor: 'rgba(31, 94, 82, 0.05)' }}>
                  <LockIcon color="primary" />
                  <Typography variant="body2">
                    Private: amount, category, supplier, receipt, beneficiary
                    <br />
                    Public: aggregate totals only
                  </Typography>
                </Box>
                {success && <Alert severity="success">Expense committed on-chain.</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Button variant="contained" fullWidth disabled={!amount || !selected || txPending} onClick={handleSubmit}>
                  {txPending ? 'Committing...' : 'Commit expense'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>This session</Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No expenses logged yet.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {history.map((entry) => (
                    <Box key={entry.id} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.76)', border: '1px solid rgba(23, 32, 51, 0.08)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.id}</Typography>
                      <Typography variant="caption" sx={{ textTransform: 'none' }}>{entry.label} - {entry.timestamp}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Expenses;
