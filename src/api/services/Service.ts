import {ErrorHandler} from "../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";

export abstract class Service {

    protected checkMethodImplementation(serviceMethod: any) {
        if (typeof serviceMethod !== 'function')
            ErrorHandler.manageGenericError(HttpStatusCode.INTERNAL_SERVER, "The strategy does not implement this method");
    }
}
