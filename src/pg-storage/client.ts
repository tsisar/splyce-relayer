import { Pool } from "pg";
import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER
} from "../config/config";

export const pgPool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
});

export async function initPgStorage() {
    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS vaa_storage
        (
            emitter_chain   INTEGER  NOT NULL,
            emitter_address TEXT     NOT NULL,
            sequence        TEXT     NOT NULL,
            vaa_base64      TEXT     NOT NULL,
            progress        SMALLINT NOT NULL DEFAULT 1,
            status          TEXT    NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'failed', 'completed')),
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (emitter_chain, emitter_address, sequence)
        );
    `);

    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS transaction_hashes
        (
            emitter_chain   INTEGER   NOT NULL,
            emitter_address TEXT      NOT NULL,
            sequence        TEXT      NOT NULL,
            tx_hash         TEXT      NOT NULL,
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            PRIMARY KEY (emitter_chain, emitter_address, sequence, tx_hash),
            FOREIGN KEY (emitter_chain, emitter_address, sequence)
                REFERENCES vaa_storage (emitter_chain, emitter_address, sequence)
                ON DELETE CASCADE
        );
    `);
}
