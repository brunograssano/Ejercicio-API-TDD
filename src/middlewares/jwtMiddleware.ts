import { Request, Response, NextFunction } from "express";
import {DecodeResult, ExpirationStatus, Session} from "../models/sessionModel";
import {decodeSession, determineExpirationStatus, encodeSession} from "../services/sessionService";

const SECRET_KEY : string = "akljsdfbuw3 c;keh20342 f394nm0mc@!#!$%!F$^ e"

const unauthorizedResponse = (response: Response,message: string) => {
    response.status(401).json({message});
}

export function jwtMiddleware(request: Request, response: Response, next: NextFunction) {

    const unauthorized = unauthorizedResponse.bind(null,response)
    const requestHeader = "JWT-Token";
    const responseHeader = "Renewed-JWT-Token";
    const header = request.header(requestHeader);
    let session: Session;

    if (!header) {
        unauthorized(`Required header was not found.`);
        return;
    }

    const decodedSession: DecodeResult = decodeSession(SECRET_KEY, header);

    if (decodedSession.type !== "valid") {
        unauthorized(`Not a valid session. Reason: ${decodedSession.type}.`);
        return;
    }

    const expiration: ExpirationStatus = determineExpirationStatus(decodedSession.session);

    if (expiration === "expired") {
        unauthorized(`Session expired. Please create a new authorization token.`);
        return;
    }

    if (expiration === "grace") {
        const { token, expiresTimestamp, issuedTimestamp } = encodeSession(SECRET_KEY, decodedSession.session);
        session = {...decodedSession.session, expiresTimestamp: expiresTimestamp, issuedTimestamp: issuedTimestamp};
        response.setHeader(responseHeader, token);
    } else {
        session = decodedSession.session;
    }

    response.locals = {
        ...response.locals,
        session: session
    };

    next();
}

export function createNewSession(request: Request, response: Response) {
    const session = encodeSession(SECRET_KEY, { id:response.locals.id, username: response.locals.username});

    response.status(201).json({message:response.locals.message, session: session});
}

export function createSessionToRecoverPassword(request: Request, response: Response) {
    const session = encodeSession(SECRET_KEY, { id:response.locals.id, username: response.locals.username});
    console.log('DEBUG - Code to reset password sent to: ' + response.locals.email)
    console.log('DEBUG - Token sent: ' + session.token)

    response.json({message:"Password reset link sent to email successfully"});
}

export function createValidateEmailSession(request: Request, response: Response) {
    const session = encodeSession(SECRET_KEY, { id:response.locals.id, username: response.locals.username});
    console.log('DEBUG - Code to validate email sent to: ' + response.locals.email)
    console.log('DEBUG - Token sent: ' + session.token)

    response.status(201).json({message:"User sign up successful, please validate email to continue", DEBUG:session});
}
