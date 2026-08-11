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
