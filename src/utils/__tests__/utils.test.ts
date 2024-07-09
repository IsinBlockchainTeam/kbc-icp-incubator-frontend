import { formatDid } from '@/utils/format';

jest.mock('../request');

describe('UNIT TEST: Utils Module', () => {
    test('formatDid returns formatted DIDs correctly', () => {
        expect(formatDid('did:test:1234567890')).toBe('did:test:12...7890');
        expect(formatDid('did:test:12345678901234567890')).toBe('did:test:12...7890');
        expect(formatDid('did:test:123')).toBe('did:test:123');
    });
});
