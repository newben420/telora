import { DB } from './../engine/db';
import { Log } from './log';
import { GRes, Res } from "./res";

export const savePurchaseMessRef = (id: any, chatid: any, lang: any) => new Promise<Res>((resolve, reject) => {
    let sql = `UPDATE user SET pur_mess_id = ?, temp_lang = ? WHERE chatid = ?`;
    DB.con().query(sql, [id, lang, chatid], (err, result) => {
        if(err){
            Log.dev(err);
            GRes.err(err.message);
        }
        else{
            GRes.succ();
        }
    });
});