import { config } from "dotenv";
import { RegexPatterns } from "./lib/regex";
import path from "path";
const args = process.argv.slice(2);
config({
    path: args[0] || ".env",
    quiet: true,
})

export class Site {
    static TITLE: string = process.env["TITLE"] || "Kinsmen";
    static ROOT: string = process.cwd() || __dirname;
    static PORT: number = parseInt(process.env["PORT"] || "0") || 3000;
    static PRODUCTION = (process.env["PRODUCTION"] || "").toLowerCase() == "true";
    static FORCE_FAMILY_4 = (process.env["FORCE_FAMILY_4"] || "").toLowerCase() == "true";
    static EXIT_ON_UNCAUGHT_EXCEPTION = (process.env["EXIT_ON_UNCAUGHT_EXCEPTION"] || "").toLowerCase() == "true";
    static EXIT_ON_UNHANDLED_REJECTION = (process.env["EXIT_ON_UNHANDLED_REJECTION"] || "").toLowerCase() == "true";
    static URL = Site.PRODUCTION ? (process.env["PROD_URL"] || "") : `http://localhost:${Site.PORT}`;
    static MAX_ALLOWED_FLOG_LOG_WEIGHT: number = parseInt(process.env["MAX_ALLOWED_FLOG_LOG_WEIGHT"] || "0") || 5;

    static TG_TOKEN: string = process.env["TG_TOKEN"] ?? "";
    static TG_ADMIN_CHAT_ID: number = parseInt(process.env["TG_ADMIN_CHAT_ID"] ?? "0") || 0;
    static TG_POLLING: boolean = (process.env["TG_POLLING"] || "").toLowerCase() == "true";
    static TG_WH_SECRET_TOKEN: string = process.env["TG_WH_SECRET_TOKEN"] ?? "edqfwvrebwtn7f";
    static TG_BOT_URL: string = process.env["TG_BOT_URL"] ?? "";

    static GROQ_KEY: string = process.env["GROQ_KEY"] || "";
    static GROQ_ENDPOINT: string = process.env["GROQ_ENDPOINT"] || "";
    static GROQ_MODELS: string[] = (process.env["GROQ_MODELS"] || "").split(" ").filter(x => x.length > 0);
    static GROQ_REQUEST_TIMEOUT_MS: number = parseInt(process.env["GROQ_REQUEST_TIMEOUT_MS"] || "0") || Infinity;
    static GROQ_MAX_RETRIES: number = parseInt(process.env["GROQ_MAX_RETRIES"] || "0") || 1;
    static GROQ_HTTP_TIMEOUT_MS: number = parseInt(process.env["GROQ_HTTP_TIMEOUT_MS"] || "0") || 60000;
    static GROQ_USE: boolean = (process.env["GROQ_USE"] || "").toLowerCase() == "true";
    static GROQ_MAX_HISTORY_COUNT: number = parseInt(process.env["GROQ_MAX_HISTORY_COUNT"] || "0") || 5;

    static DB_HOST: string = (process.env[`DB_HOST_${Site.PRODUCTION ? 'PROD' : 'DEV'}`]) || "";
    static DB_USER: string = (process.env[`DB_USER_${Site.PRODUCTION ? 'PROD' : 'DEV'}`]) || "";
    static DB_PASS: string = (process.env[`DB_PASS_${Site.PRODUCTION ? 'PROD' : 'DEV'}`]) || "";
    static DB_SCHEMA: string = (process.env[`DB_SCHEMA_${Site.PRODUCTION ? 'PROD' : 'DEV'}`]) || "";
    static DB_PORT: number = parseInt((process.env[`DB_PORT_${Site.PRODUCTION ? 'PROD' : 'DEV'}`]) || "0") || 0;
}