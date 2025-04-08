export class log {
    // ANSI color codes
    private static colors = {
        RESET: "\x1b[0m",
        GRAY: "\x1b[90m",
        GREEN: "\x1b[32m",
        YELLOW: "\x1b[33m",
        RED: "\x1b[31m",
    };

    private static levels = ["debug", "info", "warn", "error"];
    private static currentLevel = process.env.LOG_LEVEL?.toLowerCase() || "info";
    private static levelIndex = log.levels.indexOf(log.currentLevel);

    private static showTimestamp = process.env.LOG_TIMESTAMP !== "false"; // default: true

    private static shouldLog(level: string): boolean {
        const idx = log.levels.indexOf(level.toLowerCase());
        return idx >= log.levelIndex;
    }

    private static colorizeLevel(level: string): string {
        switch (level.trim()) {
            case "DEBUG":
                return `${this.colors.GRAY}${level}${this.colors.RESET}`;
            case "INFO":
                return `${this.colors.GREEN}${level}${this.colors.RESET}`;
            case "WARN":
                return `${this.colors.YELLOW}${level}${this.colors.RESET}`;
            case "ERROR":
                return `${this.colors.RED}${level}${this.colors.RESET}`;
            default:
                return level;
        }
    }

    private static formatPrefix(level: string, TAG: string): string {
        const levelColored = this.colorizeLevel(level.toUpperCase());
        const tagPart = `[${TAG}]`;
        if (this.showTimestamp) {
            const now = new Date();
            const formattedDate = now.toISOString().replace("T", " ").replace("Z", "");
            return `${formattedDate} ${levelColored} ${tagPart}`;
        }
        return `${levelColored} ${tagPart}`;
    }

    static debug(TAG: string, message: string, obj?: any): void {
        if (!this.shouldLog("debug")) return;
        const prefix = this.formatPrefix("DEBUG", TAG);
        obj ? console.debug(prefix, message, obj) : console.debug(prefix, message);
    }

    static info(TAG: string, message: string, obj?: any): void {
        if (!this.shouldLog("info")) return;
        const prefix = this.formatPrefix("INFO", TAG);
        obj ? console.info(prefix, message, obj) : console.info(prefix, message);
    }

    static warn(TAG: string, message: string, obj?: any): void {
        if (!this.shouldLog("warn")) return;
        const prefix = this.formatPrefix("WARN", TAG);
        obj ? console.warn(prefix, message, obj) : console.warn(prefix, message);
    }

    static error(TAG: string, message: string, obj?: any): void {
        if (!this.shouldLog("error")) return;
        const prefix = this.formatPrefix("ERROR", TAG);
        obj ? console.error(prefix, message, obj) : console.error(prefix, message);
    }
}