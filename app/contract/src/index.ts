import { CompiledContract } from "@midnight-ntwrk/compact-js";

export * from "./managed/donor-proof/contract/index.js";
export * from "./witnesses.js";

import * as CompiledCivicLedger from "./managed/donor-proof/contract/index.js";
import * as Witnesses from "./witnesses.js";

// Singleton compiled contract shared across API instances.
// Witnesses close over the module-level _pendingExpense slot in witnesses.ts —
// set that slot before each callTx.commitExpense() call.
export const CompiledCivicLedgerContract = CompiledContract.make<
  CompiledCivicLedger.Contract<Witnesses.CivicLedgerPrivateState>
>("CivicLedger", CompiledCivicLedger.Contract<Witnesses.CivicLedgerPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/donor-proof"),
);

