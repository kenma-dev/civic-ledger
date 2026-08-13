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

