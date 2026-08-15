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
      minDirectAid,
      maxAdmin,
    );
    this.context = {
      currentPrivateState: initial.currentPrivateState,
      currentZswapLocalState: initial.currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        initial.currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  getLedger(): Ledger {
    return ledger(this.context.currentQueryContext.state);
  }

  commitExpense(amount: bigint, isDirectAid: boolean, isAdmin: boolean): Ledger {
    setPendingExpense({
      expenseId: newExpenseId(),
      blindingFactor: newBlindingFactor(),
      amount,
      isDirectAid,
      isAdmin,
    });
    try {
      this.context = this.contract.impureCircuits.commitExpense(this.context).context;
    } finally {
      setPendingExpense(null);
    }
    return this.getLedger();
  }

  verifyCompliance(): Ledger {
    this.context = this.contract.impureCircuits.verifyCompliance(this.context).context;
    return this.getLedger();
  }
}

