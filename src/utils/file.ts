export const getFileExtension = (filename: string) => {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? '' : ext[1];
};
export const getMimeType = (filename: string): string => {
    const ext = getFileExtension(filename);
    switch (ext) {
        case 'pdf':
            return 'application/pdf';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        default:
            return '';
    }
};
