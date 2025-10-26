import { Site } from './../site';
import { GroqEngine } from './groq';
import { PromptEngine } from './prompt';
type ERType = "server" | "user" | "start" | "block" | "prem_limit" | "upgrade";

const ERLangDef = "en";

type ERLang = string;

type ERCache = Record<ERType, Record<ERLang, string>>;

const defaults: Record<ERType, string> = {
    'server': '😅🔧',
    'user': '🫣💬',
    'start': '👋🙂',
    'block': '🔴🚫⛔️',
    'prem_limit': '🕐🔒',
    'upgrade': '🕐🔒',
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