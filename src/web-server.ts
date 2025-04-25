import express from "express";
import path from "path";
import { pgPool } from "./pg-storage/client";
import { recoverVaa } from "./recover-vaa";
import { getTxHashesForVaa } from "./pg-storage/vaa";

export function startWebServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    // Serve static web UI
    app.use("/", express.static(path.join(__dirname, "../web")));

    // Get paginated VAAs
    app.get("/api/vaas", async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            const result = await pgPool.query(`
                SELECT emitter_chain, emitter_address, sequence, status, created_at
                FROM vaa_storage
                ORDER BY sequence DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);

            const enriched = result.rows.map((row) => ({
                ...row,
                emitter: row.emitter_address,
            }));

            res.json(enriched);
        } catch (err) {
            console.error("Error fetching VAAs:", err);
            res.status(500).json({ error: "Failed to fetch VAAs" });
        }
    });

    // Get transaction hashes for specific VAA
    app.get("/api/vaa-tx", async (req, res) => {
        const { emitterChain, emitterAddress, sequence } = req.query;

        if (!emitterChain || !emitterAddress || !sequence) {
            res.status(400).json({ error: "Missing query parameters" });
            return;
        }

        try {
            const txs = await getTxHashesForVaa(
                Number(emitterChain),
                String(emitterAddress),
                String(sequence)
            );
            res.json({ txs });
        } catch (e) {
            console.error("Error fetching tx hashes:", e);
            res.status(500).json({ error: "Internal error" });
        }
    });

    // Trigger VAA recovery
    app.post("/api/recover-vaa", async (req, res) => {
        const { emitterChain, emitterAddress, sequence, force } = req.body;

        if (!emitterChain || !emitterAddress || !sequence) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        try {
            await recoverVaa(
                Number(emitterChain),
                String(emitterAddress),
                String(sequence),
                Boolean(force)
            );
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error("Recovery failed:", e);
            res.status(500).json({ error: "Recovery failed" });
        }
    });

    app.listen(PORT, () => {
        console.log(`Web UI available at http://localhost:${PORT}`);
    });
}