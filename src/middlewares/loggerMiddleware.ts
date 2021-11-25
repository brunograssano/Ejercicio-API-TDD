import { RequestHandler } from "express";

export const loggerMiddleware: RequestHandler = (req, res, next) => {
    console.log(`Request from: ${req.originalUrl}`)
    console.log(`Request type: ${req.method}`)
    next();
}