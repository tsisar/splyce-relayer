# Building a Relayer for Wormhole: A Guide for Builders
### A hands-on walkthrough of building a production-grade relayer for Wormhole with TypeScript, Solana, and real-world logic.

## Introduction

On-chain investing can be complex, especially when assets or messages need to move between different blockchains. Wormhole is a powerful protocol that helps solve this — it connects ecosystems like Solana, Ethereum, BNB Chain, and more, allowing users and applications to transfer tokens and messages across chains.

But there’s a catch: these cross-chain messages, called VAAs (Verifiable Action Approvals), don’t execute anything on their own. You need something else to “make things happen.” That’s the role of a **relayer** — a service that listens for these messages and acts on them.

This guide walks through how we built a Wormhole relayer to power **Splyce**, our permissionless platform for decentralized index funds on Solana. Even if your use case is different, the lessons apply broadly.

---

## What Is Wormhole, Briefly?

Wormhole is a cross-chain messaging protocol. Instead of relying on a single bridge operator, it uses a decentralized network of **guardians**. These guardians observe activity on source chains, and when they agree something valid happened (like a token transfer), they co-sign a message — a VAA.

This VAA is proof that an event took place and can be used on another chain to trigger corresponding actions. But VAAs don’t trigger anything by default — they need to be picked up and executed.

---

## What Is a Relayer?

A **relayer** is a service that listens for new VAAs and performs custom logic based on them. It’s the bridge between observing a cross-chain event and actually doing something in response — like posting the VAA on Solana, triggering a deposit, or calling your app’s smart contract.

At Splyce, we built a relayer that:

- Watches for incoming transfers from other chains;
- Filters only the VAAs relevant to us (e.g., with specific recipients);
- Automatically posts the VAA to Solana;
- Calls our vault program (smart contract) to receive the tokens;
- Deposits those tokens into the appropriate vault.

---

## Our Vault Architecture (Why It Matters)

Splyce offers decentralized ETFs — we call them **dETFs** — that simplify on-chain investing. Behind every dETF is a **vault** — a Solana program (smart contract) that manages deposited tokens and issues share tokens to investors.

This architecture allows us to:

- Accept deposits from multiple chains;
- Manage pooled assets efficiently;
- Automate strategy logic behind the scenes.

The relayer plays a key role in this flow: it’s the “hands” that receive the cross-chain transfer and make sure the vault is updated correctly.

---

## How the Relayer Works (Step by Step)

Let’s break down how the relayer handles a cross-chain token transfer via Wormhole:

---

### 1. Listen for VAAs

The relayer connects to `wormhole-spy` — a lightweight listener that provides real-time VAA data from the Wormhole network. This avoids running a full node and gives us fast, filtered access.

We configure it to track specific emitters (smart contracts) and only listen for `TransferWithPayload` events going to Solana.

---

### 2. Filter What Matters

Not every VAA is for us. The relayer checks:

- Is this a `TransferWithPayload` event?
- Is the target chain Solana?
- Is the recipient one of our vaults?

Only then does it continue. This ensures we don't waste resources on irrelevant messages.

---

### 3. Post the VAA to Solana

To act on a VAA, we first need to **register it** on Solana’s Core Bridge. This makes Solana aware that the message was approved by Wormhole guardians.

```ts
await postVaaSolanaWithRetry(connection, wallet.signTransaction, coreBridge, wallet.key(), signedVaa);
```

---

### 4. Receive Tokens into the Vault (Splyce)

After publishing the VAA, the relayer handles token reception. In Splyce, received tokens have to be **deposited into the vault**, which is part of a decentralized ETF (dETF) system. Vault share tokens must be **transfered to the recipient**. Both vault and recipient are defined in the VAA payload.

> **What is this Vault?**  
> It’s the core of the Splyce architecture, which powers permissionless investment strategies.  
> Every deposit in Splyce lands in a `vault` — a dedicated **program** (smart contract) managing a token pool that forms the foundation for dETFs.

The actual receive step calls `receive(...)` on the custom Anchor program `wormhole_relayer`, which:

- Verifies the VAA;
- Claims transferred tokens;
- Prepares for deposit into the vault.

```ts
const instruction1 = await wormholeProgram.methods.receive(...).accounts({...}).instruction();
```

> **Note:** This logic is specific to Splyce. Your project may use a different target, such as a simple ATA or completely different business logic.

---

### 5. Deposit into the Vault

After `receive` succeeds, the next step is to **deposit tokens into the `vault`**, implemented as a Solana **program**.

> The vault is the central component in Splyce, securing user funds post-cross-chain transfer.  
> It does **not** perform strategy allocation — that’s handled internally within the vault system.

The relayer calls `executeDeposit()` on the `wormhole_relayer`:

```ts
const instruction2 = await wormholeProgram.methods.executeDeposit().accounts({...}).instruction();
```

This step:

- Deposits tokens to the vault defined in the payload;
- Transfers vault share tokens to the recipient defined in the payload.
- Records the transaction and updates progress (`DEPOSITED`).

> **This is the final step for the relayer.** What happens next (e.g., distributing assets across strategies) is out of scope for the relayer and this article.

---

## Keeping It Reliable

Cross-chain operations are fragile — a failure can happen at any stage. Our relayer includes:

- **Status tracking:** Every VAA goes through `FETCHED → POSTED → RECEIVED → DEPOSITED`.
- **AsyncLock:** Ensures only one instance handles a given VAA.
- **Retry queue (BullMQ):** If something fails, we retry intelligently.
- **PostgreSQL storage:** Every VAA is logged with its status and transaction history.

We also expose an API to recover or reprocess VAAs manually, if needed.

---

## Configuration and Deployment

Our relayer uses:

- Redis (queueing + deduplication)
- PostgreSQL (persistent state)
- Solana RPC (for on-chain calls)
- Docker/Kubernetes (for deployment)

It runs in production 24/7 and handles token transfers across Solana, Ethereum, ETC — with more chains easy to add.

---

## Final Thoughts

Building a Wormhole relayer may sound intimidating, but the core concepts are simple:

1. **Listen for cross-chain events.**
2. **Validate and post those events on Solana.**
3. **Execute your business logic.**

In our case, that logic is vault deposit — but in your case, it might be a game, a governance action, or a fund distribution.

Wormhole provides the transport. The relayer is the driver.

---

**I’ve published a demo implementation.**   
Take a look at [relayer-engine](https://github.com/tsisar/splyce-relayer) to see the full workflow in action.