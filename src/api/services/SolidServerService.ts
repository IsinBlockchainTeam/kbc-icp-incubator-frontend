import { Service } from './Service';
import {
    getFileFromSolid,
    getStringFromSolidThingAndPredicate,
    SolidDriver,
    SolidServiceWithACL,
    SolidSession,
} from '@blockchain-lib/common';

export class SolidServerService extends Service {
    private _solidService: SolidServiceWithACL;
    private readonly _companySession: SolidSession;

    constructor(serverUrl: string, clientId: string, clientSecret: string) {
        super();
        this._companySession = {
            clientId,
            clientSecret
        }
        this._solidService = new SolidServiceWithACL(new SolidDriver(serverUrl));
    }

    public async retrieveMetadata(fileUrl: string): Promise<any> {
        const metadataThing = await this._solidService.getResourceMetadata(fileUrl, this._companySession)
        return JSON.parse(getStringFromSolidThingAndPredicate(metadataThing, 'https://w3id.org/nen2660/def#InformationObject') || '{}');
    }

    public async retrieveFile(fileUrl: string): Promise<Blob> {
        const fetch = await this._solidService.authFetch(this._companySession);
        return getFileFromSolid(fileUrl, { fetch });
    }

}
