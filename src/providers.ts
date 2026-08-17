import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type MidnightWalletProvider } from './wallet.js';
import { type NetworkConfig } from './config.js';

export type CivicLedgerCircuits = 'commitExpense' | 'verifyCompliance';

export type CivicLedgerProviders = MidnightProviders<any>;

export function buildProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: NetworkConfig,
): CivicLedgerProviders {
  const zkConfigProvider = new NodeZkConfigProvider<CivicLedgerCircuits>(
    zkConfigPath,
  );

  const coinPubKeyHex = String(wallet.getCoinPublicKey()).slice(0, 32);
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `donor-proof-${coinPubKeyHex}`,
      privateStoragePasswordProvider: () => 'CivicLedger-Test-Password',
      accountId: wallet.getCoinPublicKey(),
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}

