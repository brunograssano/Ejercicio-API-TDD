
export const SALT_ROUNDS :number = 10;

export const basicAuth = (authorization : string): string[] => {
    const encoded = authorization.split(' ');
    const credentials = atob(encoded[1]).split(':');
    return credentials;
};

export const validEmail = (email : string) : boolean => {
    return false;
}
