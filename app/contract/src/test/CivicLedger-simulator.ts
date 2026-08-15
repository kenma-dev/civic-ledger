import {
  type CircuitContext,
  CostModel,
  QueryContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  type Ledger,
  ledger,
} from '../managed/donor-proof/contract/index.js';
import {
  type CivicLedgerPrivateState,
  initialPrivateState,
  newBlindingFactor,
  newExpenseId,
  setPendingExpense,
  witnesses,
} from '../witnesses.js';

export class CivicLedgerSimulator {
  private readonly contract = new Contract<CivicLedgerPrivateState>(witnesses);
  private context: CircuitContext<CivicLedgerPrivateState>;

  constructor(minDirectAid = 85n, maxAdmin = 10n) {
    const initial = this.contract.initialState(
      createConstructorContext(initialPrivateState, '0'.repeat(64)),
