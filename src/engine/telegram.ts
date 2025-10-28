import { getBasicAnalytics } from './../lib/analytics';
import { savePurchaseMessRef } from './../lib/save_purchase_mess_ref';
import { validatePreSub } from './../lib/validate_presub';
import { ensureChatPersistence } from './../lib/ensure_chat_persistence';
import { ensureUserRegistration } from './../lib/ensure_registration';
import TelegramBot from 'node-telegram-bot-api';
import { Site } from '../site';
import { Log } from '../lib/log';
import { ErrorResponse } from './error_res';
import { PromptEngine } from './prompt';
import { GroqEngine } from './groq';
import { title } from 'process';
import { PaystackEngine } from './paystack';

process.env["NTBA_FIX_350"] = 'true';

const starting = Date.now();

type CBF = (messageId: string) => void;

export class TelegramEngine {

    private static bot: TelegramBot;

    static processWebHook = (body: any) => {
        if (!Site.TG_POLLING) {
            try {
                TelegramEngine.bot.processUpdate(body);
            } catch (error) {
                Log.dev(error);
            }

        }
    }

    static processUserMessage = async (
        pid: any,
        lang: any,
        content: string,
        name: any,
        mid: any,
        mts: number,
    ) => {
        const r1 = await ensureUserRegistration(pid, lang, content, mid, name);
        if (r1.succ) {
            const pastMessages: {
                role: 'assistant' | 'user',
                content: string,
            }[] = r1.message.messages;
            const system: {
                role: 'system',
                content: string,
            } = {
                role: 'system',
                content: PromptEngine.chatSystem(`${name ? `User's first name is ${name}. ` : ''}${r1.message.summary}`),
            }
            const userid: number = r1.message.id;
            const last_rep_ts = r1.message.last_rep_ts;
            const curr_rep_count = r1.message.curr_rep_count;
            const mcount = r1.message.mcount;
            const rep_since_summ = r1.message.rep_since_summ;
            const messages = [
                system,
                ...pastMessages,
                {
                    role: 'user',
                    content: content.length > Site.FL_MAX_MESSAGE_LENGTH ? content.slice(0, Site.FL_MAX_MESSAGE_LENGTH) : content,
                }
            ] as any;
            GroqEngine.request({
                messages,
                async callback(r2) {
                    if (r2.succ) {
                        const reply = r2.message;
                        TelegramEngine.sendTextMessage(reply, pid, rid => {
                            if (rid) {
                                const rts = Date.now();
                                const r3 = ensureChatPersistence(
                                    content,
                                    mid,
                                    mts,
                                    reply,
                                    rid,
                                    rts,
                                    userid,
                                    last_rep_ts,
                                    curr_rep_count,
                                    mcount,
                                    rep_since_summ,
                                    r1.message.summary,
                                )
                            }
                        });
                    }
                    else {
                        const m = await ErrorResponse.get('server', lang);
                        TelegramEngine.sendTextMessage(m, pid);
                    }
                },
            });
        }
        else {
            if (!r1.extra.donotsend) {
                TelegramEngine.sendTextMessage(r1.message, pid);
            }
            else if (r1.extra.donotsend && r1.extra.upgrade) {
                const txt = await Promise.all([
                    ErrorResponse.get('upgrade', lang),
                    ...(Site.PS_PAYMENT_PLANS.map(x => ErrorResponse.get(`pplan_${x.id}` as any, lang))),
                ]);
                const m = txt.shift() || '';
                TelegramEngine.sendTextMessage(m, pid, undefined, {
                    parse_mode: undefined,
                    disable_web_page_preview: true,
                    protect_content: true,
                    reply_markup: {
                        inline_keyboard: Site.PS_PAYMENT_PLANS.map((p, i) => ([
                            {
                                text: `👑 ${txt[i]} (${Site.PS_CURRENCY}${p.amount.toFixed(2)})`,
                                callback_data: `sub_${i}`,
                            }
                        ])) as TelegramBot.InlineKeyboardButton[][],
                    }
                });
            }
            else {
                // do not send any message back
                TelegramEngine.deleteMessage(mid, pid);
            }
        }
    }

    static start = () => {
        return new Promise<boolean>((resolve, reject) => {
            TelegramEngine.bot = new TelegramBot(Site.TG_TOKEN, {
                polling: Site.TG_POLLING,
                request: {
                    agentOptions: {
                        family: Site.FORCE_FAMILY_4 ? 4 : undefined,
                    },
                    url: '',
                }
            });
            TelegramEngine.bot.setMyCommands([
                {
                    command: "/start",
                    description: "👋"
                },
            ]);
            if (!Site.TG_POLLING) {
                TelegramEngine.bot.setWebHook(`${Site.URL}/webhook`, {
                    secret_token: Site.TG_WH_SECRET_TOKEN,
                });
            }
            TelegramEngine.bot.on("text", async (msg) => {
                let content = (msg.text || "").trim();
                const pid = msg.from?.id || msg.chat.id;
                const name = msg.from?.first_name || msg.chat.first_name;
                const mid = msg.message_id;
                let lang = msg.from?.language_code || '';
                const mts = Date.now();
                lang = /^[a-z]{2}$/i.test(lang) ? lang : 'en';
                if (pid && (mid || mid === 0)) {
                    if (/^\/start$/.test(content)) {
                        const m = await ErrorResponse.get('start', lang);
                        TelegramEngine.sendTextMessage(m, pid);
                    }
                    else if (/^\/stats$/.test(content) && pid == Site.TG_ADMIN_CHAT_ID) {
                        TelegramEngine.sendMessage(`📊 *Basic Analytics*\n\n\`\`\`\n${await getBasicAnalytics()}\`\`\``, pid);
                    }
                    else {
                        TelegramEngine.processUserMessage(pid, lang, content, name, mid, mts);
                    }
                }
            });

            TelegramEngine.bot.on("message", async (msg) => {
                const pid = msg.from?.id || msg.chat.id;
                const lang = msg.from?.language_code;
                if (pid) {
                    if (!msg.text) {
                        const m = await ErrorResponse.get('user', lang);
                        TelegramEngine.sendTextMessage(m, pid);
                    }
                }
            });

            TelegramEngine.bot.on("callback_query", async (callbackQuery) => {
                const pid = callbackQuery.message?.chat.id || callbackQuery.message?.from?.id;
                const mid = callbackQuery.message?.message_id;
                let lang = callbackQuery.message?.from?.language_code || '';
                if (pid) {
                    if (callbackQuery.data == "") {

                    }
                    else {
                        let content = callbackQuery.data || "";
                        content = content.replace(/\-/g, ".").trim().replace(/_/g, " ").trim();
                        if (content.startsWith("sub ")) {
                            let temp = content.split(" ");
                            let id = parseInt(temp[1]);
                            if (Site.PS_PAYMENT_PLANS[id]) {
                                const plan = Site.PS_PAYMENT_PLANS[id];
                                const d = () => {
                                    if (mid) {
                                        TelegramEngine.deleteMessage(mid, pid);
                                    }
                                    TelegramEngine.bot.answerCallbackQuery(callbackQuery.id);
                                }
                                const r1 = await validatePreSub(pid, lang);
                                if (r1.succ) {
                                    const ref = `${pid}_${id}_${Date.now()}`;
                                    const r2 = await PaystackEngine.initializeTrx(plan.amount, ref, lang);
                                    if (r2.succ) {
                                        d();
                                        const url = r2.message.url;
                                        const accessCode = r2.message.code;
                                        const m = await ErrorResponse.get('purchase', lang);
                                        TelegramEngine.sendTextMessage(`${m}\n\n👉 ${url}`, pid, m => {
                                            if (m) {
                                                savePurchaseMessRef(m, pid, lang);
                                            }
                                        });
                                    }
                                    else {
                                        TelegramEngine.bot.answerCallbackQuery(callbackQuery.id, {
                                            text: r2.message,
                                        });
                                    }
                                }
                                else {
                                    TelegramEngine.bot.answerCallbackQuery(callbackQuery.id, {
                                        text: r1.message,
                                    });
                                }
                            }
                            else {
                                TelegramEngine.bot.answerCallbackQuery(callbackQuery.id, {
                                    text: await ErrorResponse.get('user_def', lang),
                                });
                            }
                        }
                    }
                }
            });

            TelegramEngine.bot.on("polling_error", (err) => {
                Log.dev(`Telegram > Polling error`, err);
            });
            TelegramEngine.bot.on("webhook_error", (err) => {
                Log.dev(`Telegram > Webhook error`, err);
            });

            Log.flow(['Telegram', 'Initialized.'], 0);
            resolve(true);
        })
    }

    static sendStringAsTxtFile = (content: string, caption: string, filename: string, chatid: any = Site.TG_ADMIN_CHAT_ID) => {
        return new Promise<boolean>((resolve, reject) => {
            TelegramEngine.bot.sendDocument(chatid, Buffer.from(content, "utf8"), {
                parse_mode: "MarkdownV2",
                caption: TelegramEngine.sanitizeMessage(caption),
            }, {
                contentType: "text/plain",
                filename: filename,
            }).then(r => {
                resolve(true);
            }).catch(err => {
                Log.dev(err);
                resolve(false);
            });
        })
    }

    static sendStringAsJSONFile = (content: string, caption: string, filename: string, chatid: any = Site.TG_ADMIN_CHAT_ID) => {
        return new Promise((resolve, reject) => {
            TelegramEngine.bot.sendDocument(chatid, Buffer.from(content, "utf8"), {
                parse_mode: "MarkdownV2",
                caption: TelegramEngine.sanitizeMessage(caption),
            }, {
                contentType: "application/json",
                filename: filename,
            }).then(r => {
                resolve(true);
            }).catch(err => {
                Log.dev(err);
                resolve(false);
            });
        })
    }

    static deleteMessage = (messageId: number, chatid: any = Site.TG_ADMIN_CHAT_ID) => {
        return new Promise<boolean>((resolve, reject) => {
            TelegramEngine.bot.deleteMessage(chatid, messageId).then(() => {
                resolve(true);
            }
            ).catch(err => {
                Log.dev(err);
                resolve(false);
            }
            );
        })
    }

    private static messageQueue: any[] = [];
    private static processing: boolean = false;
    private static WINDOW_DURATION: number = 1000;
    private static windowStart: number = Date.now();
    private static globalCount: number = 0;
    private static chatCounts: any = {};

    static sendTextMessage = (message: string, chatid: any, callback: CBF = (id) => { }, opts: TelegramBot.SendMessageOptions = {
        // parse_mode: "",
        disable_web_page_preview: true,
    }, isTemp = false,) => {
        TelegramEngine.messageQueue.push({
            message,
            callback,
            opts,
            isTemp,
            chatid,
        });

        if (!TelegramEngine.processing) {
            TelegramEngine.processQueue();
        }
    }

    static sendMessage = (message: string, chatid: any, callback: CBF = (id) => { }, opts: TelegramBot.SendMessageOptions = {
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
    }, isTemp = false,) => {
        TelegramEngine.messageQueue.push({
            message: TelegramEngine.sanitizeMessage(message),
            callback,
            opts,
            isTemp,
            chatid,
        });

        if (!TelegramEngine.processing) {
            TelegramEngine.processQueue();
        }
    }

    private static processQueue = async () => {
        TelegramEngine.processing = true;

        while (TelegramEngine.messageQueue.length > 0) {
            const now = Date.now();

            // Reset the counters if the window has passed
            if (now - TelegramEngine.windowStart >= TelegramEngine.WINDOW_DURATION) {
                TelegramEngine.windowStart = now;
                TelegramEngine.globalCount = 0;
                TelegramEngine.chatCounts = {};
            }

            let sentAny = false;
            // Use  variable to track the minimal wait time needed for any blocked message
            let nextDelay = TelegramEngine.WINDOW_DURATION;

            // Iterate through the queue and process eligible messages
            for (let i = 0; i < TelegramEngine.messageQueue.length; i++) {
                const msg = TelegramEngine.messageQueue[i];
                const chatCount = TelegramEngine.chatCounts[msg.chatId] || 0;
                const globalLimitReached = TelegramEngine.globalCount >= 30;
                const chatLimitReached = chatCount >= 1;

                // If sending this message does not exceed limits, send it immediately
                if (!globalLimitReached && !chatLimitReached) {
                    TelegramEngine.globalCount++;
                    TelegramEngine.chatCounts[msg.chatId] = chatCount + 1;
                    // Remove message from the queue and send it
                    TelegramEngine.messageQueue.splice(i, 1);
                    // Adjust index due to removal
                    i--;
                    TelegramEngine.sendIndividualMessage(msg);
                    sentAny = true;
                }
                else {
                    // Determine the delay required for either global or per-chat counter to reset
                    let globalDelay = globalLimitReached ? TelegramEngine.WINDOW_DURATION - (now - TelegramEngine.windowStart) : 0;
                    let chatDelay = chatLimitReached ? TelegramEngine.WINDOW_DURATION - (now - TelegramEngine.windowStart) : 0;
                    // The message will be eligible after the maximum of these two delays
                    const delayForMsg = Math.max(globalDelay, chatDelay);
                    // Save the minimal delay needed among all blocked messages
                    if (delayForMsg < nextDelay) {
                        nextDelay = delayForMsg;
                    }
                }
            }

            // if no messages were sent in this pass, wait for the minimal  required delay
            if (!sentAny) {
                await new Promise(resolve => setTimeout(resolve, nextDelay));
            }
        }

        TelegramEngine.processing = false;
    }

    static sanitizeMessage = (txt: string) => txt.replace(/([~>#\+\-=\|{}\.!])/g, '\\$&');

    private static lastMessageID: any = null;
    private static lastTokenMessageID: any = null

    private static sendIndividualMessage = (msg: any) => {
        const { callback, message, opts, isTemp, chatid } = msg;
        TelegramEngine.bot.sendMessage(chatid, message, opts).then((mess) => {
            Log.dev(`Telegram > Sent text.`);
            if (!isTemp) {
                TelegramEngine.lastMessageID = mess.message_id;
            }
            callback(mess.message_id);
        }).catch(err => {
            Log.dev("Telegram > Error sending text", err);
            callback(null);
        });
    }


}