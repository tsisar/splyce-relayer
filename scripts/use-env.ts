// scripts/use-env.ts
import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "dev";
const isProd = env === "prod";

const srcIdl = path.resolve(__dirname, `../idls/wormhole_relayer.${isProd ? "prod" : "dev"}.json`);
const dstIdl = path.resolve(__dirname, `../idls/wormhole_relayer.json`);

const srcTypes = path.resolve(__dirname, `../types/wormhole_relayer.${isProd ? "prod" : "dev"}.ts`);
const dstTypes = path.resolve(__dirname, `../types/wormhole_relayer.ts`);

fs.copyFileSync(srcIdl, dstIdl);
console.log(`Copied ${srcIdl} → ${dstIdl}`);

fs.copyFileSync(srcTypes, dstTypes);
console.log(`Copied ${srcTypes} → ${dstTypes}`);