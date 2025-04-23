import express from "express";
import path from "path";
import { pgPool } from "./pg-storage/client";
import { recoverVaa } from "./recoverVaa";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../web")));

app.get("/api/vaas", async (_req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT emitter_chain, emitter_address, sequence, status, CURRENT_TIMESTAMP AS created_at
            FROM vaa_storage
            ORDER BY sequence::numeric DESC
            LIMIT 50
        `);

        const enriched = result.rows.map((row) => {
            let address = row.emitter_address;
            // try {
            //     address = tryHexToNativeString(row.emitter_address, row.emitter_chain) || row.emitter_address;
            // } catch (e) {
            //     log.error("WEB","Error converting address:", e);
            // }

            return {
                ...row,
                emitter: address,
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error("Error fetching VAAs:", err);
        res.status(500).json({ error: "Failed to fetch VAAs" });
    }
});

app.post("/api/recover-vaa", async (req, res) => {
    const { emitterChain, emitterAddress, sequence } = req.body;
    try {
        await recoverVaa(Number(emitterChain), String(emitterAddress), String(sequence));
        res.status(200).json({ ok: true });
    } catch (e) {
        console.error("Recovery failed:", e);
        res.status(500).json({ error: "Recovery failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Web UI available at http://localhost:${PORT}`);
});