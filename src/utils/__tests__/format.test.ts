import { formatDid, formatClaimName, formatAddress, formatICPPrincipal } from '@/utils/format';

describe('Format utility functions', () => {
    describe('formatDid', () => {
        it('returns the same string when length is less than 16', () => {
            expect(formatDid('shortDid')).toEqual('shortDid');
        });

        it('returns a formatted string when length is 16 or more', () => {
            expect(formatDid('longDid1234567890123456')).toEqual('longDid1234...3456');
        });
    });

    describe('formatClaimName', () => {
        it('returns the last part of the claim name after splitting by "/"', () => {
            expect(formatClaimName('claim/name/part')).toEqual('part');
        });

        it('returns the same claim name when there is no "/"', () => {
            expect(formatClaimName('claim')).toEqual('claim');
        });
    });

    describe('formatAddress', () => {
        it('returns the same address when length is 8 or less', () => {
            expect(formatAddress('address')).toEqual('address');
        });

        it('returns a formatted address when length is more than 8', () => {
            expect(formatAddress('longAddress1234567890')).toEqual('longAd...7890');
        });
    });

    describe('formatICPPrincipal', () => {
        it('returns the same address when length is 20 or less', () => {
            expect(formatICPPrincipal('principal')).toEqual('principal');
        });

        it('returns a formatted address when length is more than 20', () => {
            expect(formatICPPrincipal('longPrincipal12345678901234567890')).toEqual(
                'longPrincipa...1234567890'
            );
        });
    });
});
