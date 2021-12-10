

export interface Session {
    id: string;
    username: string;
    issuedTimestamp: number;
    expiresTimestamp: number;
}

export type PartialSession = Omit<Session, "issuedTimestamp" | "expiresTimestamp">;

export interface EncodeResult {
    token: string,
    expiresTimestamp: number,
    issuedTimestamp: number
}

export type DecodeResult =
    | { type: "valid"; session: Session; }
    | { type: "integrity-error"; }
    | { type: "invalid-token"; };

export type ExpirationStatus = "expired" | "active" | "grace";