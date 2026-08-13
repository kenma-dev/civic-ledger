import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { fromHex, toHex } from '@midnight-ntwrk/compact-runtime';
import { Binding, FinalizedTransaction, Proof, SignatureEnabled, Transaction, TransactionId } from '@midnight-ntwrk/ledger-v8';
import { type UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CivicLedgerAPI, type DeployedCivicLedgerAPI, type CivicLedgerState, type CharityInfo, type CivicLedgerCircuitKeys, type CivicLedgerPrivateState } from '../../../api/src/index.js';
import { firstValueFrom, interval, map, filter, take, timeout, throwError, concatMap, catchError } from 'rxjs';
import semver from 'semver';
import { pipe as fnPipe } from 'fp-ts/function';
import type { Logger } from 'pino';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';

export const CIVIC_LEDGER_CONTRACT_ADDRESS = '1602db86f690df35e168216009f184e44a14e11f9971527e617a7629af260605';
export const CIVIC_LEDGER_NETWORK: NetworkId = 'preprod';
const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';
const DEPLOYED_CHARITY: CharityInfo = {
  name: 'CivicLedger',
  category: 'Public accountability',
  description: 'Privacy-preserving charitable spending ledger deployed on Midnight preprod.',
  contractAddress: CIVIC_LEDGER_CONTRACT_ADDRESS,
};

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ExpenseRecord = { id: string; amount: bigint; category: string; isDirectAid: boolean; isAdmin: boolean; timestamp: string; commitmentHash: string };
export type ProofRecord = { timestamp: string; directAidPct: number; adminPct: number; expenseSequence: number; txHash: string };
export type CharityDeployment = { readonly info: CharityInfo; readonly api: DeployedCivicLedgerAPI; state: CivicLedgerState | null };

export type CivicLedgerContextValue = {
  walletStatus: WalletStatus;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  charities: CharityInfo[];
  currentCharity: CharityDeployment | null;
  isCharityOwner: boolean;
  joinCharity: (address: string) => Promise<DeployedCivicLedgerAPI>;
  commitExpense: (amount: bigint, isDirectAid: boolean, isAdmin: boolean, category: string) => Promise<void>;
  verifyCompliance: () => Promise<void>;
  donorDeposit: (contractAddress: string, amount: bigint, restriction: number) => Promise<void>;
  releaseFunds: () => Promise<void>;
  expenseLog: ExpenseRecord[];
  proofRecord: ProofRecord | null;
  txPending: boolean;
  error: string | null;
};

const CivicLedgerContext = createContext<CivicLedgerContextValue | undefined>(undefined);
export const useCivicLedger = (): CivicLedgerContextValue => {
  const context = useContext(CivicLedgerContext);
  if (!context) throw new Error('useCivicLedger must be used within CivicLedgerProvider');
  return context;
};

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find((wallet): wallet is InitialAPI =>
    !!wallet && typeof wallet === 'object' && 'apiVersion' in wallet && semver.satisfies((wallet as InitialAPI).apiVersion, COMPATIBLE_CONNECTOR_API_VERSION));
};

const connectToWallet = (networkId: string): Promise<ConnectedAPI> => firstValueFrom(fnPipe(
  interval(100),
  map(getFirstCompatibleWallet),
  filter((api): api is InitialAPI => !!api),
  take(1),
  timeout({ first: 5_000, with: () => throwError(() => new Error('No compatible Midnight wallet found. Install Lace, 1AM, or another Midnight wallet and set it to Preprod.')) }),
  concatMap(async (initialAPI) => {
    const connected = await initialAPI.connect(networkId);
    await connected.getConnectionStatus();
    return connected;
  }),
  catchError(() => throwError(() => new Error('Unable to connect to Midnight wallet. Authorize this app and select Preprod.'))),
));

const getZkAssetBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    const managedDir = __CIVIC_LEDGER_MANAGED_DIR__.replace(/\\/g, '/');
    return `${window.location.origin}/@fs/${encodeURI(managedDir)}`;
  }
  return window.location.origin;
};

const buildProviders = async (networkId: NetworkId) => {
  const connectedAPI = await connectToWallet(networkId);
  const keyProvider = new FetchZkConfigProvider<CivicLedgerCircuitKeys>(getZkAssetBaseUrl(), fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const addresses = await connectedAPI.getShieldedAddresses();
  const privateStateProvider = inMemoryPrivateStateProvider<string, CivicLedgerPrivateState>();
  return {
    providers: {
      privateStateProvider,
      zkConfigProvider: keyProvider,
      proofProvider: httpClientProofProvider(config.proverServerUri!, keyProvider),
      publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
      walletProvider: {
        getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
        getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
        balanceTx: async (tx: UnboundTransaction, _ttl?: Date): Promise<FinalizedTransaction> => {
          const received = await connectedAPI.balanceUnsealedTransaction(toHex(tx.serialize()));
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>('signature', 'proof', 'binding', fromHex(received.tx));
        },
      },
      midnightProvider: {
        submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
          await connectedAPI.submitTransaction(toHex(tx.serialize()));
          return tx.identifiers()[0];
        },
      },
    },
    coinPublicKey: addresses.shieldedCoinPublicKey,
  };
};

export const CivicLedgerProvider: React.FC<React.PropsWithChildren<{ logger: Logger }>> = ({ logger, children }) => {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentCharity, setCurrentCharity] = useState<CharityDeployment | null>(null);
  const [isCharityOwner, setIsCharityOwner] = useState(false);
  const [expenseLog, setExpenseLog] = useState<ExpenseRecord[]>([]);
  const [proofRecord, setProofRecord] = useState<ProofRecord | null>(null);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providersRef = useRef<Awaited<ReturnType<typeof buildProviders>> | null>(null);
  const subscriptionsRef = useRef<{ unsubscribe(): void }[]>([]);

  const connectWallet = useCallback(async () => {
    setWalletStatus('connecting'); setError(null);
    try {
      const built = await buildProviders(CIVIC_LEDGER_NETWORK);
      providersRef.current = built;
      const api = await CivicLedgerAPI.join(built.providers as never, CIVIC_LEDGER_CONTRACT_ADDRESS, logger);
      const state = await firstValueFrom(api.state$);
      subscriptionsRef.current.forEach((subscription) => subscription.unsubscribe());
      subscriptionsRef.current = [api.state$.subscribe((next) => setCurrentCharity((previous) => previous ? { ...previous, state: next } : previous))];
      setWalletAddress(built.coinPublicKey); setWalletStatus('connected');
      setIsCharityOwner(state.campaignOwner === built.coinPublicKey.slice(0, 64));
      setCurrentCharity({ info: DEPLOYED_CHARITY, api, state });
    } catch (err) {
      setWalletStatus('disconnected');
      const message = err instanceof Error ? err.message : 'Wallet connection failed';
      setError(message); throw new Error(message);
    }
  }, [logger]);

  // Connector API has no wallet-wide disconnect operation. This ends this dApp's
  // session, drops provider references, and stops all indexer subscriptions.
  const disconnectWallet = useCallback(() => {
    subscriptionsRef.current.forEach((subscription) => subscription.unsubscribe());
    subscriptionsRef.current = [];
    providersRef.current = null;
    setWalletAddress(null);
    setWalletStatus('disconnected');
    setCurrentCharity(null);
    setIsCharityOwner(false);
    setExpenseLog([]);
    setProofRecord(null);
    setTxPending(false);
    setError(null);
  }, []);

  const joinCharity = useCallback(async (address: string) => {
    if (address !== CIVIC_LEDGER_CONTRACT_ADDRESS) throw new Error('Only configured CivicLedger preprod contract is supported.');
    if (!providersRef.current) throw new Error('Connect a Midnight wallet first.');
    return CivicLedgerAPI.join(providersRef.current.providers as never, CIVIC_LEDGER_CONTRACT_ADDRESS, logger);
  }, [logger]);

  const runTx = useCallback(async (action: () => Promise<void>, message: string) => {
    setTxPending(true); setError(null);
    try { await action(); } catch (err) { const errorMessage = err instanceof Error ? err.message : message; setError(errorMessage); throw err; } finally { setTxPending(false); }
  }, []);

  const commitExpense = useCallback((amount: bigint, isDirectAid: boolean, isAdmin: boolean, category: string) => {
    if (!currentCharity) return Promise.reject(new Error('Connect wallet and load contract first.'));
    return runTx(() => currentCharity.api.commitExpense(amount, isDirectAid, isAdmin).then(() => {
      setExpenseLog((previous) => [{ id: `E-${String(previous.length + 1).padStart(3, '0')}`, amount, category, isDirectAid, isAdmin, timestamp: new Date().toLocaleString(), commitmentHash: 'Recorded on Midnight preprod' }, ...previous]);
    }), 'Expense transaction failed');
  }, [currentCharity, runTx]);

  const verifyCompliance = useCallback(() => {
    if (!currentCharity) return Promise.reject(new Error('Connect wallet and load contract first.'));
    return runTx(() => currentCharity.api.verifyCompliance(), 'Compliance proof failed');
  }, [currentCharity, runTx]);

  const donorDeposit = useCallback((contractAddress: string, amount: bigint, restriction: number) => {
    if (!providersRef.current) return Promise.reject(new Error('Connect a Midnight wallet first.'));
    return runTx(async () => {
      const api = currentCharity?.info.contractAddress === contractAddress ? currentCharity.api : await joinCharity(contractAddress);
      await api.donorDeposit(amount, restriction);
    }, 'Donation transaction failed');
  }, [currentCharity, joinCharity, runTx]);

  const releaseFunds = useCallback(() => {
    if (!currentCharity) return Promise.reject(new Error('Connect wallet and load contract first.'));
    return runTx(() => currentCharity.api.releaseFunds(), 'Release transaction failed');
  }, [currentCharity, runTx]);

  const value: CivicLedgerContextValue = {
    walletStatus, walletAddress, connectWallet, disconnectWallet, charities: [DEPLOYED_CHARITY], currentCharity, isCharityOwner,
    joinCharity, commitExpense, verifyCompliance, donorDeposit, releaseFunds, expenseLog, proofRecord, txPending, error,
  };
  return <CivicLedgerContext.Provider value={value}>{children}</CivicLedgerContext.Provider>;
};

// Browser private state is still local by design; deployment, reads, proofs, and transactions use Midnight preprod.

