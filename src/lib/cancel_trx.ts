import { Request, Response } from "express";
import { callbackPage } from './callback_page';

// express route that is called back when transactions are completed.
export const cancelTrx = async (req: Request, res: Response) => {
    res.type('html');
    res.send(callbackPage());
}