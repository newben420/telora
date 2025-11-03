import axios from 'axios';
import { getTimeElapsed } from '../lib/date_time';
import { Log } from '../lib/log';
import { Site } from '../site';
/**
 * This helps maintain a realtime exchange rate for cases where payment currency is not in USD.
 */

const SLUG = "CurrencyEngine";
const WEIGHT = 4;

export class CurrencyEngine {
    static start = () => new Promise<boolean>((resolve, reject) => {
        if (Site.PS_CURRENCY.toLowerCase() != "usd") {
            Log.flow([SLUG, `Run initialized.`], WEIGHT);
            // Log.flow([SLUG, ``], WEIGHT);
            CurrencyEngine.run();
        }
        else{
            Log.flow([SLUG, `Engine not needed.`], WEIGHT);
        }
        resolve(true);
    });

    private static runInterval: number = 1000 * 60 * 60 * 3;

    private static USD1EqualsCurrency: number = Site.PS_CURRENCY.toLowerCase() != "usd" ? 0 : 1;

    static convert = (currAmt: number) => {
        if(!CurrencyEngine.USD1EqualsCurrency){
            return 0;
        }
        return parseFloat((currAmt / CurrencyEngine.USD1EqualsCurrency).toFixed(2));
    }


    private static run = async () => {
        Log.flow([SLUG, `Iteration`, `Initialized.`], WEIGHT);
        const startTime = Date.now();
        const conclude = () => {
            Log.flow([SLUG, `Iteration`, `Concluded.`], WEIGHT);
            const endTime = Date.now();
            const duration =  endTime - startTime;
            if(duration >= CurrencyEngine.runInterval){
                CurrencyEngine.run();
            }
            else{
                const timeLeft = CurrencyEngine.runInterval - duration;
                setTimeout(() => {
                    CurrencyEngine.run();
                }, timeLeft);
                Log.flow([SLUG, `Next Iteration scheduled for ${getTimeElapsed(0, timeLeft)}`], WEIGHT);
            }
        }
        try {
            const res = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json`);
            if(res.status == 200 && res.data && res.data.usd && res.data.usd[Site.PS_CURRENCY.toLowerCase()]){
                CurrencyEngine.USD1EqualsCurrency = parseFloat(res.data.usd[Site.PS_CURRENCY.toLowerCase()]);
                Log.flow([SLUG, `Iteration`, `Success`, `Rate updated (USD1 = ${Site.PS_CURRENCY}${CurrencyEngine.USD1EqualsCurrency}).`], WEIGHT);
            }
            else{
                Log.flow([SLUG, `Iteration`, `Error`, `An unknown error was encountered.`], WEIGHT);
            }
        } catch (error) {
            Log.dev(error);
            if((error as any).message){
                Log.flow([SLUG, `Iteration`, `Error`, `${(error as any).message}.`], WEIGHT);
            }
            else{
                Log.flow([SLUG, `Iteration`, `Error`, `An unknown error was encountered.`], WEIGHT);
            }
        }
        finally{
            conclude();
        }
    }
}