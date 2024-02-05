import { KeyPair } from '@inrupt/solid-client-authn-core';

export interface SolidToken {
    token: string,
    expiresAt: number,
    dpopKey: KeyPair
}

export interface CompanyPodInfo {
    serverUrl: string;
    clientId: string;
    clientSecret: string;
}
