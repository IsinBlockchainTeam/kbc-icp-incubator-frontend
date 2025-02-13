import { TradeType } from '@kbc-lib/coffee-trading-management-lib';

export const setParametersPath = (path = '', pathParams: { [key: string]: string }, queryParams?: { [key: string]: string | TradeType }) => {
    if (!pathParams || !path) return path;
    if (queryParams)
        path = Object.entries(queryParams)?.reduce?.((prevPath, [key, value]) => {
            return prevPath.replace(`=:${key}`, `=${value}`);
        }, path);
    return Object.entries(pathParams)?.reduce?.((prevPath, [key, value]) => {
        return prevPath.replace(`:${key}`, value);
    }, path);
};
export const createDownloadWindow = (file: Blob, filename: string) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
};
