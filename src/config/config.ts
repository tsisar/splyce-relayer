import * as dotenv from "dotenv";

dotenv.config();

export const PRIVATE_KEY = process.env.PRIVATE_KEY

export const SOLANA_RPC_ENDPOINT = "https://api.devnet.solana.com";
export const CONFIRM_TIMEOUT = 15000;
export const PRODUCTION = false;