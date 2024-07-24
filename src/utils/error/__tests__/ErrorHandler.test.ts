import { ErrorHandler } from '@/utils/error/ErrorHandler';
import { HttpStatusCode } from '@/utils/error/HttpStatusCode';
import { CustomError } from '@/utils/error/CustomError';

describe('ErrorHandler', () => {
    describe('manageUndefinedOrEmpty', () => {
        it('throws a CustomError when value is undefined', () => {
            expect(() =>
                ErrorHandler.manageUndefinedOrEmpty(
                    undefined,
                    HttpStatusCode.BAD_REQUEST,
                    'Bad request'
                )
            ).toThrow(CustomError);
        });

        it('throws a CustomError when value is null', () => {
            expect(() =>
                ErrorHandler.manageUndefinedOrEmpty(null, HttpStatusCode.BAD_REQUEST, 'Bad request')
            ).toThrow(CustomError);
        });

        it('throws a CustomError when value is an empty string', () => {
            expect(() =>
                ErrorHandler.manageUndefinedOrEmpty('', HttpStatusCode.BAD_REQUEST, 'Bad request')
            ).toThrow(CustomError);
        });

        it('does not throw when value is not undefined, null or empty', () => {
            expect(() =>
                ErrorHandler.manageUndefinedOrEmpty(
                    'value',
                    HttpStatusCode.BAD_REQUEST,
                    'Bad request'
                )
            ).not.toThrow();
        });
    });

    describe('manageGenericError', () => {
        it('throws a CustomError with the provided status code and message', () => {
            expect(() =>
                ErrorHandler.manageGenericError(HttpStatusCode.BAD_REQUEST, 'Bad request')
            ).toThrow(new CustomError(HttpStatusCode.BAD_REQUEST, 'Bad request'));
        });
    });
});
