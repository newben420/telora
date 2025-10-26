import { Site } from './../site';
import { GroqEngine } from './groq';
import { PromptEngine } from './prompt';
type ERType = "server" | "user" | "start";

const ERLangDef = "en";

type ERLang = string;

type ERCache = Record<ERType, Record<ERLang, string>>;

const defaults: Record<ERType, string> = {
    'server': '😅🔧',
    'user': '🫣💬',
    'start': '👋🙂',
};

/**
 * Responsible for sending localized error responses to users for when an error responses.
 * Also handles caching.
 */
export class ErrorResponse {
    private static cache: ERCache = {
        'server': {
            "en": "Sorry!, I encountered an error while trying to respond to you. Please try again",
        },
        'user': {
            "en": "Sorry, I could not read what you sent. I only understand texts.",
        },
        'start': {
            "en": `Hello there! I am ${Site.TITLE}, your AI companion. What's on your mind today?`
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