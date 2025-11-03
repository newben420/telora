import { getDateTime } from "../lib/date_time";
import { Site } from "../site";
import { CurrencyEngine } from "./currency";
import { GroqEngine } from "./groq";
import { TelegramEngine } from "./telegram";

export const startEngine = () => new Promise<boolean>(async (resolve, reject) => {
    const loaded = (await TelegramEngine.start()) && (await CurrencyEngine.start());
    resolve(loaded);
});

export const stopEngine = () => new Promise<boolean>(async (resolve, reject) => {
    const conclude = async () => {
        const ended = await Promise.all([
            GroqEngine.shutdown(),
        ]);
        resolve(ended.every(v => v === true));
    }
    if (Site.PRODUCTION) {
        TelegramEngine.sendMessage(`😴 ${Site.TITLE} is going back to sleep at ${getDateTime()}`, Site.TG_ADMIN_CHAT_ID, async mid => {
            conclude();
        });
    }
    else {
        conclude();
    }
});