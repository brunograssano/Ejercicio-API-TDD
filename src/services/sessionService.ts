import { encode, decode, TAlgorithm } from "jwt-simple";
import {DecodeResult, EncodeResult, ExpirationStatus, PartialSession, Session} from "../models/sessionModel";

const EXPIRATION_MINS: number = 10;
const SECONDS_IN_A_MIN: number = 60;
const MILLISECONDS_IN_A_SEC: number = 1000;
const GRACE_TIME_MINS: number = 30;

export function encodeSession(secretKey: string, partialSession: PartialSession): EncodeResult {
    const algorithm: TAlgorithm = "HS512";
    const issued = Date.now();
    const expirationTimeInMs = EXPIRATION_MINS * SECONDS_IN_A_MIN * MILLISECONDS_IN_A_SEC;
    const expires = issued + expirationTimeInMs;
    const session: Session = {
        ...partialSession,
        issuedTimestamp: issued,
        expiresTimestamp: expires
    };

    return {
        token: encode(session, secretKey, algorithm),
        issuedTimestamp: issued,
        expiresTimestamp: expires
    };
}

export function decodeSession(secretKey: string, tokenString: string): DecodeResult {

    const algorithm: TAlgorithm = "HS512";

    let result: Session;

    try {
        result = decode(tokenString, secretKey, false, algorithm);
    } catch (_e) {
        const e: Error = _e as Error;

        if (e.message === "No token supplied" || e.message === "Not enough or too many segments") {
            return {type: "invalid-token"};
        }
        if (e.message === "Signature verification failed" || e.message === "Algorithm not supported") {
            return {type: "integrity-error"};
        }
        if (e.message.indexOf("Unexpected token") === 0) {
            return {type: "invalid-token"};
        }

        throw e;
    }

    return {type: "valid", session: result}
}

export function determineExpirationStatus(token: Session): ExpirationStatus {
    const now = Date.now();

    if (now < token.expiresTimestamp) {
        return "active";
    }

    const graceTimeInMs = GRACE_TIME_MINS * SECONDS_IN_A_MIN * MILLISECONDS_IN_A_SEC;
    const timeAfterExpiration = token.expiresTimestamp + graceTimeInMs;

    if (now < timeAfterExpiration) {
        return "grace";
    }

    return "expired";
}