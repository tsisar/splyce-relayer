import * as bs58 from "bs58";

/**
 * Converts a hex string (with or without '0x') to Solana-style Base58.
 * @param hex - Hexadecimal string (optionally prefixed with '0x')
 * @returns Base58-encoded string
 */
export function hexToSolanaBase58(hex: string): string {
    // Remove 0x if present
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }

    // Ensure even-length hex string
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }

    const buffer = Buffer.from(hex, 'hex');
    return bs58.encode(buffer);
}


export function toWormholeAddress(emitterAddressHex: string): Buffer {
    const raw = Buffer.from(emitterAddressHex, "hex");
    if (raw.length === 32) return raw;
    if (raw.length > 32) throw new Error("emitterAddress too long");
    return Buffer.concat([Buffer.alloc(32 - raw.length), raw]);
}