import { TradeType } from '@isinblockchainteam/kbc-icp-incubator-library';
import { createDownloadWindow, setParametersPath } from '@/utils/page';

describe('Page utility functions', () => {
    describe('setParametersPath', () => {
        it('returns the same path when no pathParams are provided', () => {
            const path = '/test/path';
            expect(setParametersPath(path, {})).toEqual(path);
        });

        it('replaces path parameters correctly', () => {
            const path = '/test/:param1/:param2';
            const pathParams = { param1: 'value1', param2: 'value2' };
            expect(setParametersPath(path, pathParams)).toEqual('/test/value1/value2');
        });

        it('replaces query parameters correctly', () => {
            const path = '/test/=:param1/=:param2';
            const queryParams = { param1: 'value1', param2: TradeType.BASIC };
            expect(setParametersPath(path, {}, queryParams)).toEqual('/test/=value1/=0');
        });

        it('replaces both path and query parameters correctly', () => {
            const path = '/test/:param1/=:param2';
            const pathParams = { param1: 'value1' };
            const queryParams = { param2: TradeType.BASIC };
            expect(setParametersPath(path, pathParams, queryParams)).toEqual('/test/value1/=0');
        });
    });

    describe('createDownloadWindow', () => {
        it('creates a download link and clicks it', () => {
            window.URL.createObjectURL = jest.fn().mockReturnValueOnce('test');
            const createElementSpy = jest.spyOn(document, 'createElement');
            const appendChildSpy = jest.spyOn(document.body, 'appendChild');

            const file = new Blob(['test'], { type: 'text/plain' });
            const fileName = 'test.txt';

            createDownloadWindow(file, fileName);

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();

            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
        });
    });
});
