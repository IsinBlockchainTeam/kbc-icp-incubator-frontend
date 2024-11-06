export const getEthAddress = (did: string): string => {
    return did.split(':').slice(-1)[0];
};
