import { getEthAddress } from '../did';

describe('getEthAddress', () => {
    it('should extract the ethereum address from a DID string', () => {
        const did = 'did:ethr:0x1234567890abcdef';
        expect(getEthAddress(did)).toBe('0x1234567890abcdef');
    });
});
