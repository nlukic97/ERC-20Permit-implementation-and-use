# ERC20 Permit Implementation

This project demonstrates how to implement an ERC20 token with a **Permit** function, allowing gasless token approvals by using cryptographic signatures instead of the traditional `approve` function. This guide includes:

- Implementation of the `ERC20Permit` contract.
- Creation and usage of signatures to authorize spending on behalf of the signer.
- Instructions on signing the permit using Ethers.js (v6).
- A demonstration of how the permit function works, provided in the test suite.

## Getting Started

This project uses Hardhat for development, testing, and deployment. Follow these steps to install dependencies, compile the contract, and run tests.

### Prerequisites

Ensure you have **Node.js** and **npm** installed on your machine.

### Installation

1. Clone this repository.
2. Install dependencies with:

    ```bash
    npm install
    ```

### Compilation
To compile the contract, run:

```bash
npx hardhat compile
```

### Testing
To run the test suite, which includes a demo of signing and using the permit function, run:

```bash
npx hardhat test
```

## ERC20 Permit Functionality
The ERC20 Permit feature enables an account (the token owner) to authorize a spender to transfer tokens on their behalf without an on-chain transaction. This is achieved by using an off-chain signature that conforms to EIP-2612. This gasless approval is particularly useful in reducing transaction costs in decentralized finance (DeFi) and other applications where frequent approvals are required.

### ermit Function Overview
The permit function in the ERC20Permit contract enables approvals using a signature. Here’s how it works:

```
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external;
```

**Parameters**:
- `owner`: The address of the token owner.
- `spender`: The address authorized to spend tokens on behalf of the owner.
- `value`: The amount of tokens the spender is allowed to transfer.
- `deadline`: A timestamp by which the permit must be used.
- `v`, `r`, `s`: Components of the owner's signature generated off-chain.

The `permit` function verifies the provided signature, and if valid, sets an allowance for the `spender` to spend `value` tokens on behalf of the `owner`.

### Signing the Permit with Ethers.js (v6)
The `permit` signature is created using Ethers.js v6 to generate the `v`, `r`, and `s` values off-chain, allowing users to sign a message authorizing a spender without spending gas.

Here’s a JavaScript function using Ethers.js v6 to generate the permit signature:

```js
import { ethers } from "hardhat";

async function signPermit({
  owner,
  spender,
  value,
  nonce,
  deadline,
  tokenName,
  tokenAddress,
  signer,
  chainId
}) {
  const domain = {
      name: tokenName,
      version: "1",
      chainId: chainId,
      verifyingContract: tokenAddress,
  };
  
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  
  const message = {
      owner,
      spender,
      value,
      nonce,
      deadline,
  };

  const signature = await signer.signTypedData(domain, types, message);
  
  const { r, s, v } = ethers.Signature.from(signature);
  
  return { v, r, s };
}
```

## Test Suite
A demonstration of the `permit` function is available in the test suite, which includes:

1. **Signature Generation**: Using the `signPermit` function to create a signature for the `permit` function.
2. **Gasless Approval**: Verifying that an approved spender can transfer tokens on behalf of the `owner` without needing an additional approval transaction.
3. **Rejection of Expired Permits**: Ensuring that a permit with an expired `deadline` is not valid.
4. **Replay Protection**: Using a nonce to prevent replay attacks for permit-based approvals.

The test suite includes a series of tests, as shown below in the file `./test/Token.ts`.

## Project Commands
- Install dependencies: `npm install`
- Compile contracts: `npx hardhat compile`
- Run tests: `npx hardhat test`