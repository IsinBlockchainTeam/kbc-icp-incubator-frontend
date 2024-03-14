import {SolidSessionCredential} from "@blockchain-lib/common";

export interface StorageSpec {}

export interface SolidSpec extends StorageSpec {
    serverUrl: string;
    sessionCredentials?: SolidSessionCredential
}
