import { pgPool } from "./client";

export async function saveVaaToPostgres(
  emitterChain: number,
  emitterAddress: string,
  sequence: string,
  vaaBase64: string
): Promise<void> {
  const query = `
    INSERT INTO vaa_storage (emitter_chain, emitter_address, sequence, vaa_base64)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (emitter_chain, emitter_address, sequence) DO NOTHING
  `;

  await pgPool.query(query, [emitterChain, emitterAddress, sequence, vaaBase64]);
}

export async function getVaaFromPostgres(
  emitterChain: number,
  emitterAddress: string,
  sequence: string
): Promise<string | null> {
  const query = `
    SELECT vaa_base64 FROM vaa_storage
    WHERE emitter_chain = $1 AND emitter_address = $2 AND sequence = $3
  `;

  const result = await pgPool.query(query, [emitterChain, emitterAddress, sequence]);
  return result.rows[0]?.vaa_base64 ?? null;
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