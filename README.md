# CivicLedger (DonorProof)

[![Midnight Project CI/CD](https://github.com/Adrija05/civic-ledger/actions/workflows/ci.yml/badge.svg)](https://github.com/Adrija05/civic-ledger/actions)

Restricted-donation compliance and private expense commitment system for nonprofits on Midnight

## Initial Product Idea

CivicLedger addresses critical privacy requirements in Web3 applications by leveraging Midnight's zero-knowledge selective disclosure framework. The system allows users and institutions to prove compliance, eligibility, and state transitions without exposing sensitive underlying records or private inputs to the public blockchain.

## Privacy Model (Public State vs. Private Witness)

* **Public State (On-Chain Anchor)**:
  * Contract state commitments, Merkle roots, and update counters stored immutably on Midnight Preprod.
  * Zero-knowledge proof verification tokens enabling anyone to independently verify valid operations.
* **Private Witness (Off-Chain Data)**:
  * Full medical details, identity attributes, financial amounts, and internal policy rules remain local on the user's client device.
  * Nullifiers and commitments ensure single-use proof integrity without revealing user identity or payload data.

## Verified Contract Deployment

* **Network**: Midnight Preprod Testnet
* **Contract Address**: `0x02d99211a774b99812984e098712399c719e`
* **Live Demo Link**: [https://civicledger.vercel.app](https://civicledger.vercel.app)
* **Product X Profile**: [https://x.com/civicledger_zk](https://x.com/civicledger_zk)

## Requirements & Setup Instructions

### Prerequisites
* Node.js v20+ & npm / pnpm
* Compact CLI v0.5.1+
* Midnight Lace Wallet (Preprod extension)

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Adrija05/civic-ledger.git
cd civic-ledger

# 2. Install dependencies
npm install

# 3. Run contract compilation
npm run compile-contracts

# 4. Run test suite (3+ tests passing)
npm test

# 5. Launch local dev environment
npm run dev
```
