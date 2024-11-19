import { HttpStatusCode } from './HttpStatusCode';

export class CustomError extends Error {
    public readonly name: string;

    public readonly httpCode: HttpStatusCode;

    constructor(httpCode: HttpStatusCode, description: string) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = HttpStatusCode[httpCode];
        this.httpCode = httpCode.valueOf();

        Error.captureStackTrace(this);
    }
}
