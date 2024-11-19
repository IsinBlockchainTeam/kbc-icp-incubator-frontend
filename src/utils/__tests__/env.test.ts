import { checkAndGetEnvironmentVariable } from '@/utils/env';

describe('checkAndGetEnvironmentVariable', () => {
    it('returns the environment variable when it is defined', () => {
        process.env.TEST_VARIABLE = 'test value';
        const result = checkAndGetEnvironmentVariable(process.env.TEST_VARIABLE);
        expect(result).toEqual('test value');
    });

    it('throws an error when the environment variable is not defined', () => {
        delete process.env.TEST_VARIABLE;
        expect(() => checkAndGetEnvironmentVariable(process.env.TEST_VARIABLE)).toThrowError(
            'Environment variable is not defined'
        );
    });

    it('throws a custom error message when the environment variable is not defined and a custom error message is provided', () => {
        delete process.env.TEST_VARIABLE;
        expect(() =>
            checkAndGetEnvironmentVariable(process.env.TEST_VARIABLE, 'Custom error message')
        ).toThrowError('Custom error message');
    });
});
