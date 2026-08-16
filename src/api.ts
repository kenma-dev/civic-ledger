import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map, tap, type Observable } from 'rxjs';
import { type Logger } from 'pino';
import {
  createCompiledContract,
  ledger,
