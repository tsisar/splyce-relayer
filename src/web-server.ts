import express from "express";
import path from "path";
import { tryHexToNativeString } from "@certusone/wormhole-sdk";
import { pgPool } from "./pg-storage/client";
import {log} from "./logger/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", express.static(path.join(__dirname, "../web")));

app.get("/api/vaas", async (_req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT emitter_chain, emitter_address, sequence, CURRENT_TIMESTAMP AS created_at
            FROM vaa_storage
            ORDER BY sequence::numeric DESC
            LIMIT 50
        `);

        const enriched = result.rows.map((row) => {
            let address = row.emitter_address;
            try {
                address = tryHexToNativeString(row.emitter_address, row.emitter_chain) || row.emitter_address;
            } catch (e) {
                log.error("WEB","Error converting address:", e);
            }

            return {
                ...row,
                emitter_human: address,
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error("Error fetching VAAs:", err);
        res.status(500).json({ error: "Failed to fetch VAAs" });
    }
});

app.listen(PORT, () => {
    console.log(`Web UI available at http://localhost:${PORT}`);
});