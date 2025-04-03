import {Connection, PublicKeyInitData, PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@coral-xyz/anchor";

import {WormholeRelayer} from "../types/wormhole_relayer";
import IDL from "../idl/wormhole_relayer.json";

export function createWormholeRelayerProgramInterface(provider: Provider): Program<WormholeRelayer> {
    return new Program<WormholeRelayer>(
        IDL as any,
        provider
    );
}
