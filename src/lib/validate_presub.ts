import { ErrorResponse } from './../engine/error_res';
import { RowDataPacket } from 'mysql2';
import { DB } from './../engine/db';
import { GRes, Res } from "./res";
import { Log } from './log';

export const validatePreSub = (
    chatid: any,
    lang: any,
) => new Promise<Res>((resolve, reject) => {
    let sql = `SELECT * FROM user WHERE chatid = ?;`;
    DB.con().query<RowDataPacket[]>(sql, [chatid], async (err, result) => {
        if(err){
            Log.dev(err);
            resolve(GRes.err(await ErrorResponse.get('server', lang)));
        }
        else{
            if(result.length != 1){
                resolve(GRes.err(await ErrorResponse.get('user_def', lang)));
            }
            else{
                const u = result[0];
                if((!u.is_prem) || ((!!u.is_prem) && ((parseInt(u.prem_exp) || 0)  < Date.now()))){
                    resolve(GRes.succ());
                }
                else{
                    resolve(GRes.err(await ErrorResponse.get('user_def', lang)));
                }
            }
        }
    });
})