import { Site } from './../site';
import axios from 'axios';
import { GRes, Res } from './../lib/res';
import { Log } from './../lib/log';
import { ErrorResponse } from './error_res';
export class PaystackEngine {
    // implement private and public initialization and verification methods
    static initializeTrx = (
        amount: number,
        ref: string,
        lang: any,
    ) => new Promise<Res>(async (resolve, reject) => {
        try {
            const r = await axios.post(`${Site.PS_ENDPOINT}/transaction/initialize`, {
                email: Site.PS_CB_EMAIL,
                amount: `${amount * 100}`,
                currency: Site.PS_CURRENCY,
                reference: ref,
                callback_url: `${Site.URL}/verify-trx`,
                metadata: {
                    cancel_action: `${Site.URL}/cancel-trx`,
                }
            }, {
                timeout: Site.HTTP_TIMEOUT_MS,
                headers: {
                    'Authorization': `Bearer ${Site.PS_SEC_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            if(r.status == 200 && r.data && r.data.status && r.data.data && r.data.data.authorization_url && r.data.data.access_code){
                resolve(GRes.succ({
                    url: r.data.data.authorization_url,
                    code: r.data.data.access_code,
                }));
            }
            else{
                Log.dev(r.data);
                resolve(GRes.err(await ErrorResponse.get('server', lang)));
            }
        } catch (error) {
            Log.dev(error);
            resolve(GRes.err(await ErrorResponse.get('server', lang)));
        }
    });

    static validateTrx = (
        ref: string,
        lang: any,
    ) => new Promise<Res>(async (resolve, reject) => {
        try {
            const r = await axios.get(`${Site.PS_ENDPOINT}/transaction/verify/${ref}`, 
            {
                timeout: Site.HTTP_TIMEOUT_MS,
                headers: {
                    'Authorization': `Bearer ${Site.PS_SEC_KEY}`,
                }
            });
            if(r.status == 200 && r.data && r.data.status && r.data.data && r.data.data.id){
                resolve(GRes.succ(r.data.data));
            }
            else{
                Log.dev(r.data);
                resolve(GRes.err(await ErrorResponse.get('purchase_failed', lang)));
            }
        } catch (error) {
            Log.dev(error);
            resolve(GRes.err(await ErrorResponse.get('server', lang)));
        }
    });
}