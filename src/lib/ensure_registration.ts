import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DB } from './../engine/db';
import { GRes, Res } from "./res";
import { Log } from './log';
import { ErrorResponse } from './../engine/error_res';
import { Site } from './../site';

export const ensureUserRegistration = (chatid: any, lang: string | undefined) => new Promise<Res>((resolve, reject) => {
    let sql = `SELECT * FROM user WHERE chatid = ?;`;
    DB.con().query<RowDataPacket[]>(sql, [chatid], async (err, result) => {
        if (err) {
            Log.dev(err);
            resolve(GRes.err(await ErrorResponse.get('server', lang)));
        }
        else {
            if (result.length == 0) {
                // user is not registered
                let sql = `INSERT INTO user (chatid, metadata, reg_ts, is_infer, is_infer_ts) VALUES (?, ?, ?, ?, ?);`;
                const ts = Date.now();
                const meta = {};
                const ins = [
                    chatid,
                    JSON.stringify(meta),
                    ts,
                    1,
                    ts,
                ];
                DB.con().query<ResultSetHeader>(sql, ins, async (err, result) => {
                    if (err) {
                        Log.dev(err);
                        resolve(GRes.err(await ErrorResponse.get('server', lang)));
                    }
                    else {
                        resolve(GRes.succ({
                            messages: [],
                            summary: 'User is new to you and has never messaged you before.',
                            id: result.insertId,
                            last_rep_ts: 0,
                            curr_rep_count: 0,
                            mcount: 0,
                            rep_since_summ: 0,
                        }));
                    }
                });
            }
            else {
                // user is registered
                if (result[0].is_blocked) {
                    resolve(GRes.err(await ErrorResponse.get('block', lang)));
                }
                else if (result[0].is_infer && (Date.now() - parseInt(result[0].is_infer_ts || '0') < Site.FL_INFER_TIMEOUT_MS)) {
                    // inference is currently going on
                    resolve(GRes.err('', { donotsend: true }));
                }
                else if (result[0].curr_rep_count >= Site.FL_FREE_MESSAGE_LIMIT && (!result[0].is_prem)) {
                    // free limit reached
                    resolve(GRes.err('', { donotsend: true, upgrade: true }));
                }
                else if (result[0].curr_rep_count >= Site.FL_PREM_MESSAGE_LIMIT && (result[0].is_prem)) {
                    // premium limit reached
                    resolve(GRes.err(await ErrorResponse.get('prem_limit', lang)));
                }
                else {
                    const tsDay = Date.now() - (1000 * 60 * 60 * 24);
                    let sql = `SELECT content, is_reply FROM message WHERE userid = ? AND ts >= ? ORDER BY id DESC LIMIT ${Site.FL_CHAT_HISTORY_COUNT_LIMIT}; UPDATE user SET is_infer = ?, is_infer_ts = ? WHERE id = ?; SELECT COUNT(id) AS l FROM message WHERE userid = ?;`;
                    const ins = [
                        result[0].id,
                        tsDay,
                        1,
                        Date.now(),
                        result[0].id,
                        result[0].id,
                    ];
                    let summary = result[0].summary || '';
                    let id = result[0].id;
                    let last_rep_ts = parseInt(result[0].last_rep_ts) || 0;
                    let curr_rep_count = parseInt(result[0].curr_rep_count) || 0;
                    let rep_since_summ = parseInt(result[0].rep_since_summ) || 0;
                    DB.con().query<(RowDataPacket[][] | ResultSetHeader[])>(sql, ins, async (err, result) => {
                        if (err) {
                            Log.dev(err);
                            resolve(GRes.err(await ErrorResponse.get('server', lang)));
                        }
                        else {
                            resolve(GRes.succ({
                                messages: (result[0] as RowDataPacket[]).map(x => ({
                                    content: x.content,
                                    role: x.is_reply ? 'assistant' : 'user',
                                })).reverse(),
                                summary,
                                id,
                                last_rep_ts,
                                curr_rep_count,
                                mcount: (result[2] as RowDataPacket[])[0]['l'],
                                rep_since_summ,
                            }));
                        }
                    });
                }
            }
        }
    });
});