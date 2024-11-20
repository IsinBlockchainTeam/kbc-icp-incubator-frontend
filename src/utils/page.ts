import { TradeType } from '@isinblockchainteam/kbc-icp-incubator-library';

export const setParametersPath = (
    path = '',
    pathParams: { [key: string]: string },
    queryParams?: { [key: string]: string | TradeType }
) => {
    if (!pathParams || !path) return path;
    if (queryParams)
        path = Object.entries(queryParams)?.reduce?.((prevPath, [key, value]) => {
            return prevPath.replace(`=:${key}`, `=${value}`);
        }, path);
    return Object.entries(pathParams)?.reduce?.((prevPath, [key, value]) => {
        return prevPath.replace(`:${key}`, value);
    }, path);
};
export const createDownloadWindow = (file: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
};
