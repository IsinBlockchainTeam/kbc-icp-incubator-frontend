export const formatDid = (did: string): string => {
    return did.length < 16
        ? did
        : `${did.substring(0, 11)}...${did.substring(did.length - 4, did.length)}`;
};
export const formatClaimName = (claim: string): string => {
    return claim.split('/')[claim.split('/').length - 1];
};
export const formatAddress = (address: string): string => {
    return address.length > 8
        ? address.substring(0, 6) + '...' + address.substring(address.length - 4)
        : address;
};
