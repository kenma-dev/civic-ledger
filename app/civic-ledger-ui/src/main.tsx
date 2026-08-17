import './globals';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import '@midnight-ntwrk/dapp-connector-api';
import * as pino from 'pino';
import App from './App';
import { theme } from './config/theme';
import { CivicLedgerProvider } from './contexts';

setNetworkId('preprod');

export const logger = pino.pino({ level: import.meta.env.VITE_LOGGING_LEVEL as string });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <CivicLedgerProvider logger={logger}>
        <App />
      </CivicLedgerProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
