import { Pool } from "pg";

export const pgPool = new Pool({
    user: process.env.POSTGRES_USER || "graph-node",
    password: process.env.POSTGRES_PASSWORD || "let-me-in",
    database: process.env.POSTGRES_DB || "graph-node",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
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