import * as fs from 'fs';
import * as dotenv from "dotenv";
import {WORMHOLE} from "./constants";
import {CHAIN_ID_SEPOLIA, CHAIN_ID_BSC, CHAIN_ID_ETH} from "@certusone/wormhole-sdk/lib/cjs/utils/consts";
import {Environment} from "@wormhole-foundation/relayer-engine";

dotenv.config();

// const rawIdl = fs.readFileSync("../idl/wormhole_relayer.json", "utf-8");
// const idl = JSON.parse(rawIdl);

// Environment configuration
export const ENVIRONMENT = process.env.ENVIRONMENT || "dev"; // "prod" or "dev"
export const PRODUCTION = ENVIRONMENT === "prod" || false;

export const TOKEN_BRIDGE_PROGRAM = PRODUCTION ? WORMHOLE.PROD.TOKEN_BRIDGES.SOLANA : WORMHOLE.DEV.TOKEN_BRIDGES.SOLANA;
export const CORE_BRIDGE_PROGRAM = PRODUCTION ? WORMHOLE.PROD.CORE_BRIDGE.SOLANA : WORMHOLE.DEV.CORE_BRIDGE.SOLANA;

const EMITTERS_PROD = [
    {
        chainId: CHAIN_ID_ETH,
        address: WORMHOLE.DEV.TOKEN_BRIDGES.ETHEREUM_SEPOLIA
    },
];

const EMITTERS_DEV = [
    {
        chainId: CHAIN_ID_SEPOLIA,
        address: WORMHOLE.PROD.TOKEN_BRIDGES.ETHEREUM
    },
    {
        chainId: CHAIN_ID_BSC,
        address: WORMHOLE.DEV.TOKEN_BRIDGES.BNB_SMART_CHAIN
    },
];

export const EMITTERS = PRODUCTION ? EMITTERS_PROD : EMITTERS_DEV;
export const WORMHOLE_ENVIRONMENT = PRODUCTION ? Environment.MAINNET : Environment.TESTNET;

// Address of the relayer contract on Solana
export const WORMHOLE_RELAYER = process.env.WORMHOLE_RELAYER || "3VHYnZXdvZYPkHdDxsTyAfKaYzW1tm7kuR5NqPp249x5";
// Accountant address for vault
export const ACCOUNTANT = process.env.ACCOUNTANT || "EqMiuTEZuZLUWfZXLbPaT54Snqcq3asoecMdtny7rJC7";

// Wormhole RPC endpoint
export const WORMHOLE_RPC_ENDPOINT = process.env.WORMHOLE_RPC_ENDPOINT || "https://api.testnet.wormholescan.io";

// Spy server configuration
export const SPY_HOST = process.env.SPY_HOST || "localhost";
export const SPY_PORT = process.env.SPY_PORT ? Number(process.env.SPY_PORT) : 7073;

// Redis configuration
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

// PostgreSQL configuration
export const POSTGRES_USER = process.env.POSTGRES_USER || "user";
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "password";
export const POSTGRES_DB = process.env.POSTGRES_DB || "relayer-db";
export const POSTGRES_HOST = process.env.POSTGRES_HOST || "postgres";
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;

// Worker configuration
export const PRIVATE_KEY = process.env.PRIVATE_KEY
export const SOLANA_RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
export const PRIORITY_LEVEL = process.env.PRIORITY_LEVEL || "Medium"; // "High", "Medium", "Low" Helius priority levels
export const CONFIRM_TIMEOUT = parseInt(process.env.CONFIRM_TRANSACTION_INITIAL_TIMEOUT || "30000"); // 30 seconds, time to allow for the server to initially process a transaction (in milliseconds)
export const DEFAULT_COMPUTE_UNIT_PRICE = parseInt(process.env.DEFAULT_COMPUTE_UNIT_PRICE || "1000"); // Default compute unit price for the transaction, in lamports
export const MAX_COMPUTE_UNIT_PRICE = parseInt(process.env.MAX_COMPUTE_UNIT_PRICE || "1000000"); // Maximum compute unit price for the transaction, in lamports
export const COMPUTE_UNIT_LIMIT = parseInt(process.env.COMPUTE_UNIT_LIMIT || "200000"); // Maximum compute unit limit for the transaction, in compute units, use in case in not specified dinamically
export const COMPUTE_UNIT_BUFFER = parseFloat(process.env.COMPUTE_UNIT_BUFFER || "0.2"); // Buffer to add to the compute unit limit, in percentage
export const TRANSACTION_MAX_RETRIES = parseInt(process.env.TRANSACTION_MAX_RETRIES || "3"); // Maximum number of retries for the transaction in case of failure
export const TRANSACTION_RETRY_INTERVAL = parseInt(process.env.TRANSACTION_RETRY_INTERVAL || "5000"); // Retry interval for the transaction, in milliseconds
export const SIMULATE_TRANSACTION = process.env.SIMULATE_TRANSACTION !== "false"; // Simulate the transaction before sending it

const HIDDEN_KEYS = [
    "PRIVATE_KEY",
    "POSTGRES_PASSWORD",
];

export const getStartingSequenceConfig = (): Record<number, bigint> => {
    const entries: [number, bigint][] = [];

    for (const key of Object.keys(process.env)) {
        const match = key.match(/^STARTING_SEQUENCE_CHAIN_(\d+)$/);
        if (match) {
            const chainId = parseInt(match[1], 10);
            const sequenceStr = process.env[key];
            const sequence = BigInt(sequenceStr!);
            entries.push([chainId, sequence]);
        }
    }

    return Object.fromEntries(entries);
};

console.log("Loaded ENV variables:");
Object.entries(process.env).forEach(([key, value]) => {
    if (HIDDEN_KEYS.includes(key)) {
        console.log(`${key}=***`);
    } else {
        console.log(`${key}=${value}`);
    }
});