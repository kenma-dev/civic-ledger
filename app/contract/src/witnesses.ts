import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from "./managed/donor-proof/contract/index.js";

export type CivicLedgerPrivateState = Record<string, never>;

export const initialPrivateState: CivicLedgerPrivateState = {};

export type PendingExpense = {
  expenseId: Uint8Array;
  blindingFactor: Uint8Array;
  amount: bigint;
  isDirectAid: boolean;
  isAdmin: boolean;
};

// Module-level write-slot. Set immediately before callTx.commitExpense() and
// cleared in the finally block. Safe only for sequential calls — concurrent
// commitExpense invocations on the same page would race on this value.
let _pendingExpense: PendingExpense | null = null;

// Called by CivicLedgerAPI.commitExpense; witnesses read this synchronously
// during ZK proof generation. Must be cleared after each call.
export function setPendingExpense(expense: PendingExpense | null): void {
  _pendingExpense = expense;
}

export function newExpenseId(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function newBlindingFactor(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export const witnesses = {
  expenseId: ({ privateState }: WitnessContext<Ledger, CivicLedgerPrivateState>): [CivicLedgerPrivateState, Uint8Array] =>
    [privateState, _pendingExpense?.expenseId ?? new Uint8Array(32)],

  expenseBlind: ({ privateState }: WitnessContext<Ledger, CivicLedgerPrivateState>): [CivicLedgerPrivateState, Uint8Array] =>
    [privateState, _pendingExpense?.blindingFactor ?? new Uint8Array(32)],

  expenseAmount: ({ privateState }: WitnessContext<Ledger, CivicLedgerPrivateState>): [CivicLedgerPrivateState, bigint] =>
    [privateState, _pendingExpense?.amount ?? 0n],

  expenseIsDirectAid: ({ privateState }: WitnessContext<Ledger, CivicLedgerPrivateState>): [CivicLedgerPrivateState, boolean] =>
    [privateState, _pendingExpense?.isDirectAid ?? false],

  expenseIsAdmin: ({ privateState }: WitnessContext<Ledger, CivicLedgerPrivateState>): [CivicLedgerPrivateState, boolean] =>
    [privateState, _pendingExpense?.isAdmin ?? false],
};
