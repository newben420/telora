import { RowDataPacket } from 'mysql2';
import { DB } from './../engine/db';
import { GRes, Res } from "./res";
import { Log } from './log';
import { ErrorResponse } from './../engine/error_res';

export const clearUserContext = (
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
                resolve(GRes.err(await ErrorResponse.get('user', lang)));
            }
            else{
                const user = result[0];
                let sql = `UPDATE user SET summary = ?, rep_since_summ = ? WHERE id = ?; DELETE FROM message WHERE userid = ?;`;
                DB.con().query<RowDataPacket[]>(sql, [null, 0, user.id, user.id], async (err, result) => {
                    if(err){
                        Log.dev(err);
                        resolve(GRes.err(await ErrorResponse.get('server', lang)));
                    }
                    else{
                        resolve(GRes.succ(await ErrorResponse.get('data_cleared', lang)));
                    }
                });
            }
        }
    });
})