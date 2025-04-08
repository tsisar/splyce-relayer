import Transport from "winston-transport";
import { log } from "./logger";

export class CustomConsoleTransport extends Transport {
    constructor(opts: Transport.TransportStreamOptions = {}) {
        super(opts);
    }

    log(info: any, callback: () => void) {
        const originalMessage = info[Symbol.for("message")] as string;
        const level = info[Symbol.for("level")];
        const tag = info.TAG || "Relayer";

        const cleanedMessage = originalMessage.replace(/^(info|debug|warn|error):\s*/, "");

        switch (level) {
            case "debug":
                log.debug(tag, cleanedMessage);
                break;
            case "info":
                log.info(tag, cleanedMessage);
                break;
            case "warn":
                log.warn(tag, cleanedMessage);
                break;
            case "error":
                log.error(tag, cleanedMessage);
                break;
            default:
                console.log(`[${level}] [${tag}] ${cleanedMessage}`);
                break;
        }

        callback();
    }
}