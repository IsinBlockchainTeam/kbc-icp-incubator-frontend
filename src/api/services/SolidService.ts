import { CompanyPodInfo, SolidToken } from '../types/solid';
import {
    buildAuthenticatedFetch,
    createDpopHeader,
    generateDpopKeyPair,
} from '@inrupt/solid-client-authn-core';
import { createThing, getFile, getSolidDataset, getStringNoLocale, getThing, Thing } from '@inrupt/solid-client';
import { Service } from './Service';
import { Buffer } from "buffer";

export class SolidService extends Service {
    private readonly _companyPodInfo: CompanyPodInfo;

    constructor(serverUrl: string, clientId: string, clientSecret: string) {
        super();
        this._companyPodInfo = {
            serverUrl,
            clientId,
            clientSecret
        }
    }

    public async authFetch(): Promise<typeof fetch> {
        // let solidToken = await getSolidAPIToken();
        // if (!solidToken?.token || solidToken.expiresAt <= Date.now() / 1000) {
        //     solidToken = await this.retrieveSolidToken(this._companyPodInfo.serverUrl, this._companyPodInfo.clientId, this._companyPodInfo.clientSecret);
        //     setSolidAPIToken(solidToken);
        // }
        const solidToken = await this.retrieveSolidToken(this._companyPodInfo.serverUrl, this._companyPodInfo.clientId, this._companyPodInfo.clientSecret);
        return await buildAuthenticatedFetch(solidToken.token, {
            dpopKey: solidToken.dpopKey,
        });

    }

    public async retrieveMetadata(fileUrl: string): Promise<any> {
        const metadataThing = await this.getResourceMetadata(fileUrl);
        return this.getMetadataFromThing(metadataThing);
    }

    public async retrieveFile(fileUrl: string): Promise<Blob> {
        const fetch = await this.authFetch();
        return getFile(fileUrl, { fetch });
    }

    private async getResourceMetadata(resourceUrl: string): Promise<Thing> {
        const fetch = await this.authFetch();
        const resp = await fetch(resourceUrl, {
            method: 'HEAD',
        });

        const linkHeader = resp.headers.get('Link');
        if (linkHeader == null) throw new Error(`Cannot get resource metadata: ${resp.statusText}`);

        const linkHeaderParts = linkHeader.split(',');
        const linkHeaderPart = linkHeaderParts.find((part: string) => part.includes('rel="describedby"'));
        if (linkHeaderPart == null) throw new Error(`Cannot get resource metadata: ${resp.statusText}`);

        const metadataUrl = linkHeaderPart.split(';')[0].replace('<', '').replace('>', '').trim();
        const metadataDataset = await getSolidDataset(metadataUrl, { fetch });

        let metadataThing = getThing(metadataDataset, resourceUrl);
        if (!metadataThing) metadataThing = createThing({ url: resourceUrl });
        return metadataThing;
    }

    private async retrieveSolidToken(oidcIssuer: string, clientId: string, clientSecret: string): Promise<SolidToken> {
        // A key pair is needed for encryption.
        // This function from `solid-client-authn` generates such a pair for you.
        const dpopKey = await generateDpopKeyPair();

        const authString = `${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`;
        // This URL can be found by looking at the "token_endpoint" field at
        // {SOLID_SERVER_BASE_URL}/.well-known/openid-configuration

        const openIdConfig = await (await fetch(`${oidcIssuer}.well-known/openid-configuration`)).json();
        const tokenEP = openIdConfig.token_endpoint;
        const issuedAt = Date.now() / 1000;
        const body = 'grant_type=client_credentials&scope=webid';
        const headers = {
            Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            dpop: await createDpopHeader(tokenEP, 'POST', dpopKey),
        };

        const response = await fetch(tokenEP, {
            method: 'POST',
            headers,
            body,
        });

        const data = await response.json();
        return {
            token: data.access_token,
            expiresAt: issuedAt + data.expires_in,
            dpopKey,
        };
    }

    private getMetadataFromThing(thing: Thing): any {
        return JSON.parse(getStringNoLocale(thing, 'https://w3id.org/nen2660/def#InformationObject') || '{}');
    }
}
