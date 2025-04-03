import {AnchorProvider, Program, Wallet, Idl, Provider} from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { CONFIRM_TIMEOUT, PRODUCTION, SOLANA_RPC_ENDPOINT } from "../config/config";
import {log} from "../logger/logger"
import {WormholeRelayer} from "../types/wormhole_relayer";
import IDL from "../idl/wormhole_relayer.json";

const TAG = "ProviderManager";

export class Manager {
    private provider: AnchorProvider | null = null;
    private program: Program<WormholeRelayer> | null = null;
    private readonly adminKeypair: Keypair;

    constructor(adminKeypair: Keypair) {
        this.adminKeypair = adminKeypair;
    }

    private initProvider() {
        log.debug(TAG, "Initializing provider...");

        const wallet = new Wallet(this.adminKeypair);
        const connection = new Connection(SOLANA_RPC_ENDPOINT, {
            commitment: "confirmed",
            confirmTransactionInitialTimeout: CONFIRM_TIMEOUT,
        });

        this.provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: "processed",
            commitment: "confirmed",
            skipPreflight: true,
            maxRetries: 0,
        });

        log.debug(TAG, "Provider initialized.");
    }

    private initProgram() {
        if (!this.provider) throw new Error("Provider is not initialized");

        log.debug(TAG, "Initializing program...");
        log.debug(TAG, `Environment: ${PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}`);

        this.program = new Program(IDL as Idl, this.provider);

        log.debug(TAG, "Program initialized.");
    }

    private async isConnectionHealthy(): Promise<boolean> {
        if (!this.provider) return false;

        try {
            const version = await this.provider.connection.getVersion();
            log.debug(TAG, `Connection healthy: ${version}`);
            return true;
        } catch (err) {
            log.warn(TAG, `Connection health check failed: ${err}`);
            return false;
        }
    }

    async ensureProviderHealth(): Promise<void> {
        if (!this.provider || !(await this.isConnectionHealthy())) {
            log.debug(TAG, "(Re)initializing provider & program...");
            this.initProvider();
            this.initProgram();
        }
    }

    public async getProgram(): Promise<Program<WormholeRelayer>> {
        await this.ensureProviderHealth();
        if (!this.program) throw new Error("Program is not initialized");
        return this.program;
    }

    public async getProvider(): Promise<AnchorProvider> {
        await this.ensureProviderHealth();
        if (!this.provider) throw new Error("Provider is not initialized");
        return this.provider;
    }
}