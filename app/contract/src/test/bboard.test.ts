import { describe, expect, it } from 'vitest';
import { CivicLedgerSimulator } from './CivicLedger-simulator.js';

describe('CivicLedger Compact circuits', () => {
  it('initializes public thresholds and empty spend state', () => {
    const simulator = new CivicLedgerSimulator(85n, 10n);
    const state = simulator.getLedger();

    expect(state.directAidThreshold).toBe(85n);
    expect(state.adminThreshold).toBe(10n);
    expect(state.totalSpend).toBe(0n);
    expect(state.directAidSpend).toBe(0n);
    expect(state.adminSpend).toBe(0n);
    expect(state.expenseSequence).toBe(0n);
    expect(state.isVerified).toBe(false);
  });

  it('commits direct-aid and admin expenses into the ledger', () => {
    const simulator = new CivicLedgerSimulator();
    simulator.commitExpense(900n, true, false);
    const state = simulator.commitExpense(100n, false, true);

    expect(state.totalSpend).toBe(1000n);
    expect(state.directAidSpend).toBe(900n);
    expect(state.adminSpend).toBe(100n);
    expect(state.expenseSequence).toBe(2n);
    expect(state.isVerified).toBe(false);
  });

  it('verifies a ledger when thresholds pass', () => {
    const simulator = new CivicLedgerSimulator();
    simulator.commitExpense(900n, true, false);
    simulator.commitExpense(100n, false, true);

    const state = simulator.verifyCompliance();
    expect(state.isVerified).toBe(true);
  });

  it('rejects verification when direct aid threshold fails', () => {
    const simulator = new CivicLedgerSimulator();
    simulator.commitExpense(500n, true, false);
    simulator.commitExpense(500n, false, true);

    expect(() => simulator.verifyCompliance()).toThrow('direct aid below threshold');
  });

  it('accepts a custom threshold configured at construction', () => {
    const simulator = new CivicLedgerSimulator(60n, 25n);
    const state = simulator.getLedger();

    expect(state.directAidThreshold).toBe(60n);
    expect(state.adminThreshold).toBe(25n);
    simulator.commitExpense(75n, true, false);
    simulator.commitExpense(25n, false, true);

    expect(simulator.verifyCompliance().isVerified).toBe(true);
  });

  it('accumulates several direct-aid entries without losing sequence order', () => {
    const simulator = new CivicLedgerSimulator();
    const first = simulator.commitExpense(400n, true, false);
    const second = simulator.commitExpense(300n, true, false);
    const third = simulator.commitExpense(200n, true, false);

    expect(first.totalSpend).toBe(400n);
    expect(first.expenseSequence).toBe(1n);
    expect(second.totalSpend).toBe(700n);
    expect(second.expenseSequence).toBe(2n);
    expect(third.totalSpend).toBe(900n);
    expect(third.directAidSpend).toBe(900n);
    expect(third.expenseSequence).toBe(3n);
  });

  it('rejects an admin ratio above configured maximum', () => {
    const simulator = new CivicLedgerSimulator(85n, 10n);
    simulator.commitExpense(100n, true, false);
    simulator.commitExpense(100n, false, true);

    expect(() => simulator.verifyCompliance()).toThrow('admin above threshold');
    expect(simulator.getLedger().isVerified).toBe(false);
  });

  it('rejects an expense marked as both direct aid and admin', () => {
    const simulator = new CivicLedgerSimulator();

    expect(() => simulator.commitExpense(100n, true, true)).toThrow(
      'expense cannot be both direct aid and admin',
    );
    expect(simulator.getLedger().totalSpend).toBe(0n);
    expect(simulator.getLedger().expenseSequence).toBe(0n);
  });

  it('rejects verification before any expense is committed', () => {
    const simulator = new CivicLedgerSimulator();

    expect(() => simulator.verifyCompliance()).toThrow('no expenses committed');
    expect(simulator.getLedger().isVerified).toBe(false);
  });

  it('changes the public commitment chain for every accepted entry', () => {
    const simulator = new CivicLedgerSimulator();
    const initialHash = simulator.getLedger().expenseChainHash;
    const first = simulator.commitExpense(50n, true, false);
    const second = simulator.commitExpense(50n, true, false);

    expect(first.expenseChainHash).not.toEqual(initialHash);
    expect(second.expenseChainHash).not.toEqual(first.expenseChainHash);
    expect(second.totalSpend).toBe(100n);
  });

  it('keeps direct-aid and admin totals independent', () => {
    const simulator = new CivicLedgerSimulator(50n, 50n);
    simulator.commitExpense(20n, true, false);
    simulator.commitExpense(30n, false, true);
    simulator.commitExpense(40n, true, false);

    const state = simulator.getLedger();
    expect(state.totalSpend).toBe(90n);
    expect(state.directAidSpend).toBe(60n);
    expect(state.adminSpend).toBe(30n);
    expect(state.directAidSpend + state.adminSpend).toBe(state.totalSpend);
  });

  it('verifies exact boundary percentages', () => {
    const simulator = new CivicLedgerSimulator(85n, 10n);
    simulator.commitExpense(85n, true, false);
    simulator.commitExpense(10n, false, true);
    simulator.commitExpense(5n, false, false);

    const state = simulator.verifyCompliance();
    expect(state.totalSpend).toBe(100n);
    expect(state.directAidSpend * 100n).toBeGreaterThanOrEqual(
      state.totalSpend * state.directAidThreshold,
    );
    expect(state.adminSpend * 100n).toBeLessThanOrEqual(
      state.totalSpend * state.adminThreshold,
    );
    expect(state.isVerified).toBe(true);
  });
});

