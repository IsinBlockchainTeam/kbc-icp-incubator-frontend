import {ErrorHandler} from "../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import SingletonSigner from "../SingletonSigner";

export abstract class Service {

    protected readonly _walletAddress: string = '';

    protected constructor() {
        if (SingletonSigner.getInstance()) {
            const address = SingletonSigner.getInstance()?.address;
            ErrorHandler.manageUndefinedOrEmpty(address, HttpStatusCode.UNAUTHORIZED, "The wallet address is not set");
            this._walletAddress = address!;
        }
    }
}
