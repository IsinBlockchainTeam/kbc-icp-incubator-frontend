import { getFileExtension, getMimeType } from '@/utils/file';

describe('File utility functions', () => {
    describe('getFileExtension', () => {
        it('returns the correct extension for a given filename', () => {
            expect(getFileExtension('test.pdf')).toEqual('pdf');
            expect(getFileExtension('test.png')).toEqual('png');
            expect(getFileExtension('test.jpg')).toEqual('jpg');
        });

        it('returns an empty string when no extension is present', () => {
            expect(getFileExtension('test')).toEqual('');
        });
    });

    describe('getMimeType', () => {
        it('returns the correct MIME type for a given filename', () => {
            expect(getMimeType('test.pdf')).toEqual('application/pdf');
            expect(getMimeType('test.png')).toEqual('image/png');
            expect(getMimeType('test.jpg')).toEqual('image/jpeg');
        });

        it('returns an empty string when no matching MIME type is found', () => {
            expect(getMimeType('test.txt')).toEqual('');
        });
    });
});
