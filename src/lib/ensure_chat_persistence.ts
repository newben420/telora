import { GroqEngine } from './../engine/groq';
import { PromptEngine } from './../engine/prompt';
import { Log } from './log';
import { Site } from './../site';
import { DB } from './../engine/db';
import { GRes, Res } from "./res";
import { RowDataPacket } from 'mysql2';

export const ensureChatPersistence = (
    message: string,
    message_id: any,
    message_ts: number,
    reply: string,
    reply_id: any,
    reply_ts: number,
    user_id: number,
    last_rep_ts: number,
    curr_rep_count: number,
    mcount: number,
    rep_since_summ: number,
    summary: string,

) => new Promise<Res>((resolve, reject) => {
    let n_last_rep_ts = last_rep_ts <= 0 ? Date.now() : last_rep_ts;
    const isnewday = (Date.now() - n_last_rep_ts) >= (1000 * 60 * 60 * 24);
    if(isnewday){
        n_last_rep_ts = Date.now();
    }
    let n_curr_rep_count = isnewday ? 1 : (curr_rep_count + 1);
    let sql = `
    INSERT INTO message (userid, messid, content, is_reply, ts) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?);
    UPDATE user SET is_infer = ?, total_mess = total_mess + 1, total_rep = total_rep + 1, rep_since_summ = rep_since_summ + 1, last_rep_ts = ?, curr_rep_count = ? WHERE id = ?;
    ${mcount > Site.FL_CHAT_HISTORY_PERSIST_LIMIT ? `DELETE FROM message WHERE userid = ? ORDER BY id ASC LIMIT ${(mcount - Site.FL_CHAT_HISTORY_PERSIST_LIMIT)};` : ''} 
    `;
    let ins = [
        user_id,
        message_id,
        message,
        0,
        message_ts,
        user_id,
        reply_id,
        reply,
        1,
        reply_ts,
        0,
        n_last_rep_ts,
        n_curr_rep_count,
        user_id,
    ];

    if (mcount > Site.FL_CHAT_HISTORY_PERSIST_LIMIT) {
        ins.push(user_id);
    }

    DB.con().query(sql, ins, (err, result) => {
        if (err) {
            Log.dev(err);
            resolve(GRes.err(err));
        }
        else {
            if (rep_since_summ >= Site.FL_SUMMARY_AFTER_REP_COUNT) {
                let sql = `SELECT * FROM message WHERE userid = ? AND is_reply = 0 ORDER BY id DESC LIMIT ${Site.FL_SUMMARY_AFTER_REP_COUNT};`
                DB.con().query<RowDataPacket[]>(sql, [user_id], (err, result) => {
                    if (err) {
                        Log.dev(err);
                        resolve(GRes.err(err));
                    }
                    else {
                        if (result.length > 0) {
                            result.reverse();
                            const { system, user } = PromptEngine.summary(result.map(x => x.content));
                            GroqEngine.request({
                                messages: [
                                    { role: 'system', content: system },
                                    { role: 'user', content: user },
                                ],
                                callback(r) {
                                    if (r.succ) {
                                        const { system, user } = PromptEngine.merge(summary, r.message);
                                        GroqEngine.request({
                                            messages: [
                                                { role: 'system', content: system },
                                                { role: 'user', content: user },
                                            ],
                                            callback(r) {
                                                if (r.succ) {
                                                    let sql = `UPDATE user SET summary = ?, rep_since_summ = ? WHERE id = ?;`;
                                                    DB.con().query(sql, [r.message, 0, user_id], (err, result) => {
                                                        if (err) {
                                                            Log.dev(err);
                                                            resolve(GRes.err(err));
                                                        }
                                                        else {
                                                            resolve(GRes.succ());
                                                        }
                                                    });
                                                }
                                                else {
                                                    resolve(GRes.err(r.message));
                                                }
                                            },
                                        });
                                    }
                                    else {
                                        resolve(GRes.err(r.message));
                                    }
                                },
                            });
                        }
                        else {
                            resolve(GRes.succ());
                        }
                    }
                });
            }
            else {
                resolve(GRes.succ());
            }
        }
    });
});