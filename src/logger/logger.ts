export class log {
    private static formatPrefix(level: string, TAG: string): string {
        const now = new Date();
        const formattedDate = now.toISOString().replace("T", " ").replace("Z", "");
        return `${formattedDate} ${level.toUpperCase()} [${TAG}]`;
    }

    static debug(TAG: string, message: string, obj?: any): void {
        const prefix = this.formatPrefix("DEBUG", TAG);
        obj ? console.debug(prefix, message, obj) : console.debug(prefix, message);
    }

    static info(TAG: string, message: string, obj?: any): void {
        const prefix = this.formatPrefix("INFO", TAG);
        obj ? console.info(prefix, message, obj) : console.info(prefix, message);
    }

    static warn(TAG: string, message: string, obj?: any): void {
        const prefix = this.formatPrefix("WARN", TAG);
        obj ? console.warn(prefix, message, obj) : console.warn(prefix, message);
    }

    static error(TAG: string, message: string, obj?: any): void {
        const prefix = this.formatPrefix("ERROR", TAG);
        obj ? console.error(prefix, message, obj) : console.error(prefix, message);
    }
}