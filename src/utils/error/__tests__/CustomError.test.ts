import { CustomError } from '@/utils/error/CustomError';
import { HttpStatusCode } from '@/utils/error/HttpStatusCode';

describe('CustomError', () => {
    it('sets the correct name and httpCode when instantiated', () => {
        const error = new CustomError(HttpStatusCode.BAD_REQUEST, 'Bad request');
        expect(error.name).toEqual('BAD_REQUEST');
        expect(error.httpCode).toEqual(HttpStatusCode.BAD_REQUEST);
        expect(error.message).toEqual('Bad request');
    });

    it('captures the stack trace', () => {
        const error = new CustomError(HttpStatusCode.BAD_REQUEST, 'Bad request');
        expect(error.stack).toBeDefined();
    });

    it('sets the prototype correctly', () => {
        const error = new CustomError(HttpStatusCode.BAD_REQUEST, 'Bad request');
        expect(Object.getPrototypeOf(error)).toBe(CustomError.prototype);
    });
});
