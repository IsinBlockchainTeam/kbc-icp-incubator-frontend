import { HttpStatusCode } from './HttpStatusCode';
import { CustomError } from './CustomError';

export class ErrorHandler {
    public static manageUndefinedOrEmpty(
        value: any,
        errorStatusCode: HttpStatusCode,
        errorMessage: string
    ): void {
        if (!value || value.length === 0) throw new CustomError(errorStatusCode, errorMessage);
    }

    public static manageGenericError(errorStatusCode: HttpStatusCode, errorMessage: string): void {
        throw new CustomError(errorStatusCode, errorMessage);
    }
}
