import { PaystackEngine } from './../engine/paystack';
import {Request, Response} from "express";
import { Site } from "src/site";
import { validatePostSub } from "./validate_postsub";
import { TelegramEngine } from "src/engine/telegram";

// express route that is called back when transactions are completed.
export const verifyTrx = async (req: Request, res: Response) => {
    const reference = (req.query.reference || '').toString();
    const trxref = req.query.trxref || '';
    const p = reference.split("_").filter(x => x.length > 0);
    const valid: boolean = (p.length == 3)  && (!!p[0]) && (Site.PS_PAYMENT_PLANS[parseInt(p[1])]) && /^[\d]+$/.test(p[2]);
    if(valid){
        const r1 = await validatePostSub(p[0]);
        if(r1.succ){
            const r2 = await PaystackEngine.validateTrx(reference, r1.message.lang);
            if(r2.succ){
                TelegramEngine.deleteMessage(r1.message.puid, parseInt(p[0]));
                const details = JSON.stringify(r2.message);
                const mess = r1.message.mess;
                // now send receipt on telegram
                // finalize transaction in db: update prem/prem exp, set temp_fields to null, save details to transaction table.
                // resume inference in temp message so maybe message can eb sent
                // redirect or return a html page that closes popup in tg or shows a big telegram with arrow button to return to telegram
                // TODO
                // receipt should contain transaction success ttle with details such as plan name, plan cost,a nd when t expires
            }
            else{
                TelegramEngine.sendTextMessage(r2.message, parseInt(p[0]));
            }
        }
        else{
            if(r1.extra.exists){
                TelegramEngine.sendTextMessage(r1.message, parseInt(p[0]));
            }
        }
    }
    else{
        res.sendStatus(400);
    }
    console.log(reference, trxref);
    res.send(200);
}