import { request } from '@/utils/request';

describe('request', () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns parsed JSON when response is JSON', async () => {
        const mockResponse = { text: () => Promise.resolve('{"key":"value"}') };
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await request('http://test.com', { method: 'GET' });
        expect(result).toEqual({ key: 'value' });
    });

    it('returns text when response is not JSON', async () => {
        const mockResponse = { text: () => Promise.resolve('Not JSON') };
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await request('http://test.com', { method: 'GET' });
        expect(result).toEqual('Not JSON');
    });

    it('returns blob when responseType is blob', async () => {
        const mockResponse = { blob: () => Promise.resolve(new Blob()) };
        mockFetch.mockResolvedValueOnce(mockResponse);

        const result = await request('http://test.com', { method: 'GET', responseType: 'blob' });
        expect(result).toBeInstanceOf(Blob);
    });

    it('sets headers correctly', async () => {
        const mockResponse = { text: () => Promise.resolve('{"key":"value"}') };
        mockFetch.mockResolvedValueOnce(mockResponse);

        await request('http://test.com', { method: 'GET' }, 'application/xml');
        expect(mockFetch).toHaveBeenCalledWith('http://test.com', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/xml',
                Accept: 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
    });
});
