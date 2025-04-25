// scripts/use-env.ts
import fs from "fs";
import path from "path";

export const PRODUCTION = process.env.ENVIRONMENT === "prod" || false;

const srcIdl = path.resolve(__dirname, `../idls/wormhole_relayer.${PRODUCTION ? "prod" : "dev"}.json`);
const dstIdl = path.resolve(__dirname, `../src/provider/programs/wormhole_relayer.json`);

const srcTypes = path.resolve(__dirname, `../types/wormhole_relayer.${PRODUCTION ? "prod" : "dev"}.ts`);
const dstTypes = path.resolve(__dirname, `../src/provider/programs/wormhole_relayer.ts`);

fs.copyFileSync(srcIdl, dstIdl);
console.log(`Copied ${srcIdl} → ${dstIdl}`);

fs.copyFileSync(srcTypes, dstTypes);
console.log(`Copied ${srcTypes} → ${dstTypes}`);