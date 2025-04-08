import Transport from "winston-transport";
import { log } from "./logger";

export class CustomConsoleTransport extends Transport {
    constructor(opts: Transport.TransportStreamOptions = {}) {
        super(opts);
    }

    log(info: any, callback: () => void) {
        const formattedMessage = info[Symbol.for("message")];
        const level = info[Symbol.for("level")];
        const tag = info.TAG || "Relayer";

        switch (level) {
            case "debug":
                log.debug(tag, formattedMessage);
                break;
            case "info":
                log.info(tag, formattedMessage);
                break;
            case "warn":
                log.warn(tag, formattedMessage);
                break;
            case "error":
                log.error(tag, formattedMessage);
                break;
            default:
                console.log(`[${level}] [${tag}] ${formattedMessage}`);
                break;
        }

        callback();
    }
}