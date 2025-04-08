import { Pool } from "pg";
import {POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER} from "../config/config";

export const pgPool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
});

export async function initPgStorage() {
    await pgPool.query(`
    CREATE TABLE IF NOT EXISTS vaa_storage (
      emitter_chain INTEGER NOT NULL,
      emitter_address TEXT NOT NULL,
      sequence TEXT NOT NULL,
      vaa_base64 TEXT NOT NULL,
      PRIMARY KEY (emitter_chain, emitter_address, sequence)
    );
  `);
}

// TODO зберігати хеш транзакцій