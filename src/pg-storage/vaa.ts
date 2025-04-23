import { pgPool } from "./client";

export async function saveVaa(
    emitterChain: number,
    emitterAddress: string,
    sequence: string,
    vaaBase64: string,
    status: "received" | "failed" | "completed" = "received"
): Promise<void> {
  const query = `
    INSERT INTO vaa_storage (emitter_chain, emitter_address, sequence, vaa_base64, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (emitter_chain, emitter_address, sequence) DO NOTHING
  `;
  await pgPool.query(query, [emitterChain, emitterAddress, sequence, vaaBase64, status]);
}

export async function getVaa(
    emitterChain: number,
    emitterAddress: string,
    sequence: string
): Promise<{ vaa_base64: string, status: string } | null> {
  const query = `
    SELECT vaa_base64, status FROM vaa_storage
    WHERE emitter_chain = $1 AND emitter_address = $2 AND sequence = $3
  `;
  const result = await pgPool.query(query, [emitterChain, emitterAddress, sequence]);
  if (result.rows.length === 0) return null;
  return {
    vaa_base64: result.rows[0].vaa_base64,
    status: result.rows[0].status,
  };
}

export async function updateVaaStatus(
    emitterChain: number,
    emitterAddress: string,
    sequence: string,
    status: "received" | "failed" | "completed"
): Promise<void> {
  const query = `
        UPDATE vaa_storage
        SET status = $4
        WHERE emitter_chain = $1 AND emitter_address = $2 AND sequence = $3
    `;
  await pgPool.query(query, [emitterChain, emitterAddress, sequence, status]);
}

export async function getLatestSequence(
    emitterChain: number,
    emitterAddress: string
): Promise<string | null> {
  const query = `
    SELECT sequence
    FROM vaa_storage
    WHERE emitter_chain = $1 AND emitter_address = $2
    ORDER BY sequence::numeric DESC
    LIMIT 1
  `;
  const result = await pgPool.query(query, [emitterChain, emitterAddress]);
  return result.rows[0]?.sequence ?? null;
}

export async function saveTxHash(
    emitterChain: number,
    emitterAddress: string,
    sequence: string,
    txHash: string
): Promise<void> {
  const query = `
    INSERT INTO transaction_hashes (emitter_chain, emitter_address, sequence, tx_hash)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `;
  await pgPool.query(query, [emitterChain, emitterAddress, sequence, txHash]);
}

export async function getTxHashesForVaa(
    emitterChain: number,
    emitterAddress: string,
    sequence: string
): Promise<string[]> {
  const query = `
    SELECT tx_hash FROM transaction_hashes
    WHERE emitter_chain = $1 AND emitter_address = $2 AND sequence = $3
    ORDER BY created_at ASC
  `;
  const result = await pgPool.query(query, [emitterChain, emitterAddress, sequence]);
  return result.rows.map(row => row.tx_hash);
}