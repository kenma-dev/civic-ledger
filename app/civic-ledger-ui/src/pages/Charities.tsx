import React, { useState } from 'react';
import { Alert, Box, Chip, Container, Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCivicLedger } from '../contexts';
import CharityCard from '../components/CharityCard';

const CATEGORIES = ['All', 'Humanitarian', 'Medical', 'Housing', 'Education', 'Food Aid'];

const Charities: React.FC = () => {
  const { charities } = useCivicLedger();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = charities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5} sx={{ mb: 4 }}>
          <Typography variant="h2">Campaign registry</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
            Each campaign publishes a public compliance result while keeping its expense data private.
            Search the registry, filter by mission, and inspect the current proof state.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              placeholder="Search campaigns"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', md: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  onClick={() => setCategory(cat)}
                  color={category === cat ? 'primary' : 'default'}
                  variant={category === cat ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>

        {charities.length === 0 ? (
          <Alert severity="info">No charities are registered yet.</Alert>
        ) : filtered.length === 0 ? (
          <Alert severity="info">No campaigns match your search.</Alert>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((c) => (
              <Grid key={c.contractAddress} size={{ xs: 12, sm: 6, md: 4 }}>
                <CharityCard charity={c} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Charities;

