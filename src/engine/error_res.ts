import { Site } from './../site';
import { GroqEngine } from './groq';
import { PromptEngine } from './prompt';
type ERType = "server" | "user" | "start" | "block" | "prem_limit" | "upgrade" |
    "pplan_week" | "pplan_month" | "pplan_year" | "pplan_life" | "user_def" | "purchase"
    | "purchase_failed";

const ERLangDef = "en";

type ERLang = string;

type ERCache = Record<ERType, Record<ERLang, string>>;

const defaults: Record<ERType, string> = {
    'server': '😅🔧',
    'user': '🫣💬',
    'user_def': '🫣💬',
    'start': '👋🙂',
    'block': '🔴🚫⛔️',
    'prem_limit': '🕐🔒',
    'upgrade': '🕐🔒',
    "pplan_week": "1 Week",
    "pplan_month": "1 Month",
    "pplan_year": "1 Year",
    "pplan_life": "Lifetime",
    "purchase": "💰✅",
    "purchase_failed": "🚫⛔️",
};

/**
 * Responsible for sending localized error responses to users for when an error responses.
 * Also handles caching.
 */
export class ErrorResponse {
    private static cache: ERCache = {
        'server': {
            "en": Site.ERR_RES_EN_SERVER,
        },
        'user': {
            "en": Site.ERR_RES_EN_USER,
        },
        'user_def': {
            "en": Site.ERR_RES_EN_USER_DEF,
        },
        'start': {
            "en": Site.ERR_RES_EN_START,
        },
        'block': {
            "en": Site.ERR_RES_EN_BLOCK,
        },
        'prem_limit': {
            "en": Site.ERR_RES_EN_PREM_LIMIT,
        },
        'upgrade': {
            "en": Site.ERR_RES_EN_UPGRADE,
        },
        'purchase': {
            "en": Site.ERR_RES_EN_PURCHASE,
        },
        "pplan_week": {
            "en": "1 Week",
        },
        "pplan_month": {
            "en": "1 Month",
        },
        "pplan_year": {
            "en": "1 Year",
        },
        "pplan_life": {
            "en": "Lifetime",
        },
        "purchase_failed": {
            "en": Site.ERR_RES_EN_PURCHASE_FAILED,
        }
    }

    static get = (type: ERType, lang: ERLang = ERLangDef) => new Promise<string>((resolve, reject) => {
        if (ErrorResponse.cache[type][lang]) {
            resolve(ErrorResponse.cache[type][lang])
        }
        else {
            const { system, user } = PromptEngine.translation(lang, ErrorResponse.cache[type][ERLangDef]);
            GroqEngine.request({
                messages: [
                    {
                        role: 'system',
                        content: system,
                    },
                    {
                        role: 'user',
                        content: user,
                    },
                ],
                callback(r) {
                    if (r.succ) {
                        ErrorResponse.cache[type][lang] = r.message;
                        resolve(r.message);
                    }
                    else {
                        resolve(defaults[type] || '');
                    }
                },
            })
        }
    });
}