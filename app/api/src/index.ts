import * as CivicLedger from '../../contract/src/managed/donor-proof/contract/index.js';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import {
  type CivicLedgerContract,
  type CivicLedgerProviders,
  type DeployedCivicLedgerContract,
  CivicLedgerPrivateStateKey,
} from './common-types.js';
import {
  CompiledCivicLedgerContract,
  setPendingExpense,
  initialPrivateState,
  newExpenseId,
  newBlindingFactor,
} from '../../contract/src/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map, type Observable } from 'rxjs';

export interface CivicLedgerState {
  readonly campaignOwner: string;
  readonly directAidThreshold: number;
  readonly adminThreshold: number;
  readonly totalSpend: bigint;
  readonly directAidSpend: bigint;
  readonly adminSpend: bigint;
  readonly expenseSequence: number;
  readonly isVerified: boolean;
  readonly directAidPct: number;
  readonly adminPct: number;
  readonly potHasCoin: boolean;
  readonly potValue: bigint;
}

// Facade interface consumed by the UI context; hides SDK internals.
export interface DeployedCivicLedgerAPI {
  readonly contractAddress: ContractAddress;
  readonly state$: Observable<CivicLedgerState>;
  commitExpense: (amount: bigint, isDirectAid: boolean, isAdmin: boolean) => Promise<void>;
  verifyCompliance: () => Promise<void>;
  donorDeposit: (amount: bigint, restriction: number) => Promise<void>;
  releaseFunds: () => Promise<void>;
}

// Derives computed display fields (pcts) so callers avoid raw bigint arithmetic.
// Guards against divide-by-zero when no expenses are committed yet.
function buildState$(
  providers: CivicLedgerProviders,
  contractAddress: ContractAddress,
): Observable<CivicLedgerState> {
  return providers.publicDataProvider
    .contractStateObservable(contractAddress, { type: 'all' })
    .pipe(
      map((contractState) => {
        const s = CivicLedger.ledger(contractState.data);
        const total = s.totalSpend > 0n ? s.totalSpend : 1n;
        return {
          campaignOwner: Buffer.from(s.campaignOwner.bytes).toString('hex'),
          directAidThreshold: Number(s.directAidThreshold),
          adminThreshold: Number(s.adminThreshold),
          totalSpend: s.totalSpend,
          directAidSpend: s.directAidSpend,
          adminSpend: s.adminSpend,
          expenseSequence: Number(s.expenseSequence),
          isVerified: s.isVerified,
          directAidPct: s.totalSpend > 0n ? Number((s.directAidSpend * 100n) / total) : 0,
          adminPct: s.totalSpend > 0n ? Number((s.adminSpend * 100n) / total) : 0,
          potHasCoin: s.potHasCoin,
          potValue: s.potHasCoin ? s.pot.value : 0n,
        };
      }),
    );
}

// Browser-side entry point. Use deploy() or join() — never call constructor directly.
export class CivicLedgerAPI implements DeployedCivicLedgerAPI {
  readonly contractAddress: ContractAddress;
  readonly state$: Observable<CivicLedgerState>;

  private constructor(
    contractAddress: ContractAddress,
    state$: Observable<CivicLedgerState>,
    private readonly deployedContract: DeployedCivicLedgerContract,
    private readonly logger?: Logger,
  ) {
    this.contractAddress = contractAddress;
    this.state$ = state$;
  }

  async commitExpense(amount: bigint, isDirectAid: boolean, isAdmin: boolean): Promise<void> {
    this.logger?.info({ amount, isDirectAid, isAdmin }, 'commitExpense');
    // Set the module-global witness slot then clear it in finally — see witnesses.ts.
    setPendingExpense({
      expenseId: newExpenseId(),
      blindingFactor: newBlindingFactor(),
      amount,
      isDirectAid,
      isAdmin,
    });
    try {
      await this.deployedContract.callTx.commitExpense();
    } finally {
      setPendingExpense(null);
    }
  }

  async verifyCompliance(): Promise<void> {
    this.logger?.info('verifyCompliance');
    await this.deployedContract.callTx.verifyCompliance();
  }

  async donorDeposit(amount: bigint, restriction: number): Promise<void> {
    this.logger?.info({ amount, restriction }, 'donorDeposit');
    // Synthetic coin: nonce is random, color is zero (NIGHT token placeholder).
    // The wallet's balanceTx handles actual UTXO selection.
    const coin = {
      nonce: crypto.getRandomValues(new Uint8Array(32)),
      color: new Uint8Array(32),
      value: amount,
    };
    await this.deployedContract.callTx.donorDeposit(coin, BigInt(restriction));
  }

  async releaseFunds(): Promise<void> {
    this.logger?.info('releaseFunds');
    await this.deployedContract.callTx.releaseFunds();
  }

  static async deploy(
    providers: CivicLedgerProviders,
    minDirectAid: number,
    maxAdmin: number,
    logger?: Logger,
  ): Promise<CivicLedgerAPI> {
    logger?.info('deployContract');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deployed = await (deployContract as any)(providers, {
      compiledContract: CompiledCivicLedgerContract,
      privateStateId: CivicLedgerPrivateStateKey,
      initialPrivateState,
      args: [BigInt(minDirectAid), BigInt(maxAdmin)],
    });
    const contractAddress = deployed.deployTxData.public.contractAddress;
    const state$ = buildState$(providers, contractAddress);
    return new CivicLedgerAPI(contractAddress, state$, deployed as DeployedCivicLedgerContract, logger);
  }

  static async join(
    providers: CivicLedgerProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<CivicLedgerAPI> {
    logger?.info({ contractAddress }, 'joinContract');
    const deployed = await findDeployedContract<CivicLedgerContract>(providers, {
      contractAddress,
      compiledContract: CompiledCivicLedgerContract,
      privateStateId: CivicLedgerPrivateStateKey,
      initialPrivateState,
    });
    const state$ = buildState$(providers, contractAddress);
    return new CivicLedgerAPI(contractAddress, state$, deployed, logger);
  }
}

export * from './common-types.js';
