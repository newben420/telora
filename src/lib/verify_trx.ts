import { ErrorResponse } from './../engine/error_res';
import { PaystackEngine } from './../engine/paystack';
import { Request, Response } from "express";
import { Site } from "./../site";
import { validatePostSub } from "./validate_postsub";
import { TelegramEngine } from "./../engine/telegram";
import { getDateTime3 } from './date_time';
import { savePurchase } from './save_purchase';
import { callbackPage } from './callback_page';

// express route that is called back when transactions are completed.
export const verifyTrx = async (req: Request, res: Response) => {
    const reference = (req.query.reference || '').toString();
    const trxref = req.query.trxref || '';
    const p = reference.split("_").filter(x => x.length > 0);
    const valid: boolean = (p.length == 3) && (!!p[0]) && (Site.PS_PAYMENT_PLANS[parseInt(p[1])]) && /^[\d]+$/.test(p[2]);
    if (valid) {
        const r1 = await validatePostSub(p[0]);
        const plan = Site.PS_PAYMENT_PLANS[parseInt(p[1])];
        const pid = await ErrorResponse.get(`pplan_${plan.id}` as any, r1.message.lang);
        if (r1.succ) {
            const r2 = await PaystackEngine.validateTrx(reference, r1.message.lang);
            if (r2.succ) {
                TelegramEngine.deleteMessage(r1.message.puid, parseInt(p[0]));
                const details = JSON.stringify(r2.message);
                const mess = r1.message.mess;
                const exp = Date.now() + plan.duration;
                const expRead = getDateTime3(exp);
                let m: string = `👑 ${pid} ✅\n\n`
                m += `⏳ ${expRead}\n`;
                m += `💰 ${Site.PS_CURRENCY} ${plan.amount}`;
                TelegramEngine.sendTextMessage(m, parseInt(p[0]));
                const r3 = await savePurchase(p[0], exp, details, plan.amount);
                if (r3.succ) {
                    TelegramEngine.processUserMessage(parseInt(p[0]), r1.message.lang, mess, r1.message.name, r1.message.messid, Date.now());
                }
                else {
                    TelegramEngine.sendTextMessage(`👑 ${pid} ❌\n\n` + (await ErrorResponse.get('server', r1.message.lang)), parseInt(p[0]));
                }
                // resume inference in temp message so maybe message can be sent
                // redirect or return a html page that closes popup in tg or shows a big telegram with arrow button to return to telegram
                // TODO
                // work on payment cancelation route
            }
            else {
                TelegramEngine.sendTextMessage(`👑 ${pid} ❌\n\n` + r2.message, parseInt(p[0]));
            }
        }
        else {
            if (r1.extra.exists) {
                TelegramEngine.sendTextMessage(`👑 ${pid} ❌\n\n` + r1.message, parseInt(p[0]));
            }
        }
    }
    res.type('html');
    res.send(callbackPage());
}