import { ErrorResponse } from './../engine/error_res';
import { RowDataPacket } from 'mysql2';
import { DB } from './../engine/db';
import { GRes, Res } from "./res";
import { Log } from './log';

export const validatePostSub = (
    chatid: any,
) => new Promise<Res>((resolve, reject) => {
    let sql = `SELECT * FROM user WHERE chatid = ?;`;
    DB.con().query<RowDataPacket[]>(sql, [chatid], async (err, result) => {
        if(err){
            Log.dev(err);
            resolve(GRes.err(await ErrorResponse.get('server')));
        }
        else{
            if(result.length != 1){
                resolve(GRes.err(await ErrorResponse.get('user_def')));
            }
            else{
                const u = result[0];
                if((!u.is_prem) || ((!!u.is_prem) && ((parseInt(u.prem_exp) || 0)  < Date.now()))){
                    resolve(GRes.succ({
                        mess: u.temp_mess,
                        puid: parseInt(u.pur_mess_id) || 0,
                        lang: u.temp_lang,
                        messid: u.temp_mess_id,
                        name: u.temp_name,
                    }));
                }
                else{
                    resolve(GRes.err(await ErrorResponse.get('user_def', u.temp_lang), {exists: true}));
                }
            }
        }
    });
})