import { Site } from './../site';
import { RowDataPacket } from "mysql2";
import { DB } from "./../engine/db";
import { FFF, formatNumber } from "./format_number";

export const getBasicAnalytics = () => new Promise<string>((resolve, reject) => {
    // total users
    // total users who have intereacted at least one
    // total transactions count
    // total revenue
    let sql = `
    SELECT COUNT(id) AS l FROM user;
    SELECT COUNT(id) AS l FROM user WHERE total_rep > 0;
    SELECT COUNT(id) AS l FROM transaction;
    SELECT amt FROM transaction;
    `;
    DB.con().query<RowDataPacket[][]>(sql, (err, result) => {
        if(err){
            resolve(err.message);
        }
        else{
            let m: string[] = [];
            m.push(`Total Users: ${formatNumber(result[0][0]['l'])}`);
            m.push(`Total Users w/ Interactions: ${formatNumber(result[1][0]['l'])}`);
            m.push(`Total Transactions: ${formatNumber(result[3][0]['l'])}`);
            m.push(`Total Revenue: ${Site.PS_CURRENCY} ${FFF(result[3].map(x => parseFloat(x['amt']) || 0).reduce((a, b) => a +b, 0))}`);
            resolve(m.join('\n'));
        }
    });
});