import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ProofBadge from './ProofBadge';
import SpendBar from './SpendBar';
import { useCivicLedger } from '../contexts';
import { type CivicLedgerState } from '../../../api/src/index.js';
import { type CharityInfo } from '../../../api/src/common-types.js';

type Props = { charity: CharityInfo };

const CharityCard: React.FC<Props> = ({ charity }) => {
  const navigate = useNavigate();
  const { joinCharity } = useCivicLedger();
  const [state, setState] = useState<CivicLedgerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let sub: { unsubscribe(): void } | null = null;

    joinCharity(charity.contractAddress)
      .then((api) => {
        sub = api.state$.subscribe((snapshot) => {
          if (!mounted) return;
          setState(snapshot);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));

    return () => {
      mounted = false;
      sub?.unsubscribe();
    };
  }, [charity.contractAddress, joinCharity]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ mb: 0.4 }}>{charity.name}</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label={charity.category} size="small" />
                <Chip icon={<VisibilityOffIcon fontSize="small" />} label="Private state" size="small" variant="outlined" />
              </Stack>
            </Box>
            {loading ? <Skeleton width={84} height={30} /> : state ? <ProofBadge verified={state.isVerified} /> : null}
          </Box>

          {charity.description && <Typography variant="body2">{charity.description}</Typography>}

          {loading ? (
            <Skeleton variant="rounded" height={10} />
          ) : state && state.totalSpend > 0n ? (
            <Box>
              <SpendBar directAidPct={state.directAidPct} adminPct={state.adminPct} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {state.expenseSequence} expense{state.expenseSequence === 1 ? '' : 's'} committed
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No expenses recorded yet.
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1.2, pt: 0.5 }}>
            <Button variant="outlined" fullWidth onClick={() => navigate(`/charity/${charity.contractAddress}`)}>
              View campaign
            </Button>
            <Button variant="contained" fullWidth onClick={() => navigate(`/charity/${charity.contractAddress}`)}>
              Donate
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CharityCard;

