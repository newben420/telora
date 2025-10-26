import { config } from "dotenv";
import { RegexPatterns } from "./lib/regex";
import path from "path";
const args = process.argv.slice(2);
config({
    path: args[0] || ".env",
    quiet: true,
})

export class Site {
    static TITLE: string = process.env["TITLE"] || "Telora";
    static PERSONA: string = process.env["PERSONA"] || "A warm, emotionally intelligent conversationalist. Gentle tone, empathetic responses, uses soft humor and reflection. Prefers listening and offering insight over giving direct advice.";
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

    static FL_CHAT_HISTORY_COUNT_LIMIT: number = parseInt(process.env['FL_CHAT_HISTORY_COUNT_LIMIT'] || '0') || 5;
    static FL_CHAT_HISTORY_PERSIST_LIMIT: number = parseInt(process.env['FL_CHAT_HISTORY_PERSIST_LIMIT'] || '0') || 15;
    static FL_FREE_MESSAGE_LIMIT: number = parseInt(process.env['FL_FREE_MESSAGE_LIMIT'] || '0') || 5;
    static FL_PREM_MESSAGE_LIMIT: number = parseInt(process.env['FL_PREM_MESSAGE_LIMIT'] || '0') || 20;
    static FL_INFER_TIMEOUT_MS: number = parseInt(process.env['FL_INFER_TIMEOUT_MS'] || '0') || 2000;
    static FL_MAX_MESSAGE_LENGTH: number = parseInt(process.env['FL_MAX_MESSAGE_LENGTH'] || '0') || 256;
    static FL_MAX_REPLY_LENGTH: number = parseInt(process.env['FL_MAX_REPLY_LENGTH'] || '0') || 256;
    static FL_SUMMARY_AFTER_REP_COUNT: number = parseInt(process.env['FL_SUMMARY_AFTER_REP_COUNT'] || '0') || 10;

    static ERR_RES_EN_SERVER: string = process.env['ERR_RES_EN_SERVER'] || `Sorry!, I encountered an error while trying to respond to you. Please try again`;
    static ERR_RES_EN_USER: string = process.env['ERR_RES_EN_USER'] || `Sorry, I could not read what you sent. I only understand texts.`;
    static ERR_RES_EN_START: string = process.env['ERR_RES_EN_START'] || `Hello there! I am ${Site.TITLE}, your AI companion. What's on your mind today?`;
    static ERR_RES_EN_BLOCK: string = process.env['ERR_RES_EN_BLOCK'] || `You have been blocked. Please do not respond or send another message.`;
    static ERR_RES_EN_PREM_LIMIT: string = process.env['ERR_RES_EN_PREM_LIMIT'] || `You have reached your message limit. Please try again in 1 hour.`;
    static ERR_RES_EN_UPGRADE: string = process.env['ERR_RES_EN_UPGRADE'] || `You have reached your message limit. Upgrade to premium to remove your limit, or try again in 1 hour.`;
}