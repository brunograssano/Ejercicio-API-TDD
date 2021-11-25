import { RequestHandler } from "express";

export const getHealthInfo: RequestHandler = (req, res) => {
        res.json({
                uptime: process.uptime(),
                message: 'Ok',
                date: new Date()
              }
        );    
}
