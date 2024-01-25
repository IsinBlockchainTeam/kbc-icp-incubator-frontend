import {getWalletAddress} from "../../utils/storage";
import {ErrorHandler} from "../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";

export abstract class Strategy {
    protected readonly _walletAddress: string = '';

    protected constructor(isBlockchain: boolean) {
        if (isBlockchain) {
            const address = getWalletAddress();
            ErrorHandler.manageUndefinedOrEmpty(address, HttpStatusCode.UNAUTHORIZED, "The wallet address is not set");
            this._walletAddress = address!;
        }
    }

    protected checkService(service: any) {
        ErrorHandler.manageUndefinedOrEmpty(service, HttpStatusCode.INTERNAL_SERVER,"The service is not defined, please invoke init() method");
    }
}
