import { createTheme } from '@mui/material';

const ink = '#172033';
const moss = '#1F5E52';
const sand = '#F4F0E8';
const stone = '#D9D1C4';
const brass = '#A46E43';

export const theme = createTheme({
  typography: {
    fontFamily: '"IBM Plex Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    allVariants: { color: ink },
    h1: { fontWeight: 700, fontSize: 'clamp(2.6rem, 5vw, 5rem)', letterSpacing: '-0.05em', lineHeight: 0.96 },
    h2: { fontWeight: 700, fontSize: 'clamp(2rem, 3.6vw, 3rem)', letterSpacing: '-0.04em', lineHeight: 1.02 },
    h3: { fontWeight: 650, fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', letterSpacing: '-0.03em' },
    h4: { fontWeight: 650, fontSize: '1.3rem', letterSpacing: '-0.025em' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '0.98rem' },
    body1: { fontSize: '1rem', lineHeight: 1.7 },
    body2: { fontSize: '0.92rem', lineHeight: 1.6, color: '#56606E' },
    caption: { fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280' },
  },
  palette: {
    primary: { main: moss, dark: '#143A33', light: '#3D7C72', contrastText: '#ffffff' },
    secondary: { main: brass, contrastText: '#ffffff' },
    background: { default: sand, paper: '#FFFDF9' },
    success: { main: '#2E7D5B', light: '#E6F4ED' },
    warning: { main: '#B7791F', light: '#FAE8C4' },
    error: { main: '#C24747' },
    text: { primary: ink, secondary: '#5E6877' },
    divider: stone,
  },
  shape: { borderRadius: 20 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top left, rgba(31, 94, 82, 0.12), transparent 36%), radial-gradient(circle at 90% 15%, rgba(164, 110, 67, 0.10), transparent 28%), linear-gradient(180deg, #F7F2E9 0%, #F4F0E8 58%, #EFE8DC 100%)',
          backgroundAttachment: 'fixed',
        },
        '*::selection': { backgroundColor: 'rgba(31, 94, 82, 0.18)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(247, 242, 233, 0.86)',
          color: ink,
          borderBottom: `1px solid rgba(23, 32, 51, 0.08)`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 650,
          borderRadius: 999,
          minHeight: 44,
          boxShadow: 'none',
          paddingInline: '1.1rem',
        },
        contained: {
          background: `linear-gradient(135deg, ${moss}, #173E37)`,
          '&:hover': { background: `linear-gradient(135deg, #16443C, #12322D)` },
        },
        outlined: {
          borderColor: 'rgba(23, 32, 51, 0.18)',
          '&:hover': { borderColor: moss, backgroundColor: 'rgba(31, 94, 82, 0.04)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(23, 32, 51, 0.08)',
          boxShadow: '0 18px 45px rgba(23, 32, 51, 0.07)',
          borderRadius: 24,
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,252,247,0.96))',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 24px 50px rgba(23, 32, 51, 0.11)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.78)',
            '&.Mui-focused fieldset': { borderColor: moss, borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: moss },
        },
      },
    },
  },
});

