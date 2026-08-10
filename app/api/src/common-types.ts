import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { Contract, Witnesses, CivicLedgerPrivateState } from '../../contract/src/index.js';

export type { CivicLedgerPrivateState } from '../../contract/src/index.js';

export const CivicLedgerPrivateStateKey = 'CivicLedgerPrivateState';
export type PrivateStateId = typeof CivicLedgerPrivateStateKey;

export type PrivateStates = {
  readonly CivicLedgerPrivateState: CivicLedgerPrivateState;
};

export type CivicLedgerContract = Contract<CivicLedgerPrivateState, Witnesses<CivicLedgerPrivateState>>;
export type CivicLedgerCircuitKeys = Exclude<keyof CivicLedgerContract['impureCircuits'], number | symbol>;
export type CivicLedgerProviders = MidnightProviders<CivicLedgerCircuitKeys, PrivateStateId, CivicLedgerPrivateState>;
export type DeployedCivicLedgerContract = FoundContract<CivicLedgerContract>;

export type CharityInfo = {
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly contractAddress: string;
};

export type ExpenseEntry = {
  readonly id: string;
  readonly amount: number;
  readonly category: 'food' | 'medical' | 'housing' | 'logistics' | 'admin';
  readonly isDirectAid: boolean;
  readonly isAdmin: boolean;
  readonly timestamp: string;
};

export type CivicLedgerLedgerState = {
  readonly campaignOwner: { bytes: Uint8Array };
  readonly directAidThreshold: bigint;
  readonly adminThreshold: bigint;
  readonly totalSpend: bigint;
  readonly directAidSpend: bigint;
  readonly adminSpend: bigint;
  readonly expenseChainHash: Uint8Array;
  readonly expenseSequence: bigint;
  readonly isVerified: boolean;
  readonly potHasCoin: boolean;
  readonly potValue: bigint;
};

