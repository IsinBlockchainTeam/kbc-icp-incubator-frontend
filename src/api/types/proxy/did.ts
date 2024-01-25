type DIDKey = {
    id: string,
    controller: string,
    type: string,
    publicKeyBase58: string
}

export type DID = {
    id: string,
    publicKey: DIDKey[],
    keyAgreement: DIDKey[],
    localMetadata: {
        initialDidDocument: {
            id: string,
            keyAgreement: DIDKey[],
            authentication: string[]
        }
    }
}
