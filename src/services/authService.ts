

export const basicAuth = (authorization : string): string[] => {
    const encoded = authorization.split(' ');
    const credentials = atob(encoded[1]).split(':');
    return credentials;
};


