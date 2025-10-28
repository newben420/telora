import { DB } from './../engine/db';
import { Log } from './log';
import { GRes, Res } from "./res";

export const savePurchase = (
    chatid: any,
    exp: number,
    trx_details: string,
    trx_amt: number,

) => new Promise<Res>((resolve, reject) => {
    let sql = `UPDATE user SET is_prem = ?, prem_exp = ?, temp_mess = ?, pur_mess_id = ? WHERE chatid= ?; INSERT into transaction (description, amt, ts, chatid) VALUES (?, ?, ?, ?);`;
    const ins = [
        1,
        exp,
        null,
        null,
        chatid,
        trx_details,
        trx_amt,
        Date.now(),
        chatid,
    ];
    DB.con().query(sql, ins, (err, result) => {
        if(err){
            Log.dev(err);
            resolve(GRes.err());
        }
        else{
            resolve(GRes.succ());
        }
    });
});