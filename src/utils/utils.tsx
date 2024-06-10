import {ICP} from "../constants";
import {TradeType, URL_SEGMENTS} from "@kbc-lib/coffee-trading-management-lib";
import React, {ReactNode} from "react";

export const setParametersPath = (
    path = "",
    pathParams: { [key: string]: string },
    queryParams?: { [key: string]: string | TradeType},
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

export const getFileExtension = (filename: string) => {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? "" : ext[1];
};

export const checkAndGetEnvironmentVariable = (variable: string | undefined, errorMessage?: string): string => {
    if (!variable) throw new Error(errorMessage ? errorMessage : `Environment variable is not defined`);
    return variable;
};

export const formatDid = (did: string): string => {
    return did.length < 16
        ? did
        : `${did.substring(0, 11)}...${did.substring(did.length - 4, did.length)}`;
};

export const formatClaimName = (claim: string): string => {
    return claim.split("/")[claim.split("/").length - 1];
};

export const formatAddress = (address: string): string => {
    return address.length > 8 ? address.substring(0, 6) + "..." + address.substring(address.length - 4) : address;
}

export const getMimeType = (filename: string): string => {
    const ext = getFileExtension(filename);
    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "png":
            return "image/png";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        default:
            return "";
    }
}

export const createDownloadWindow = (file: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
}


export const getICPCanisterURL = (canisterId: string): string => {
    return checkAndGetEnvironmentVariable(ICP.DFX_NETWORK) === "local" ?
        URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.LOCAL_REPLICA :
        URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.MAINNET;
}

export const showTextWithHtmlLinebreaks = (text: string): ReactNode => {
    return (
        <>
            {text.split('\n').map((str, index) => (
                <React.Fragment key={index}> {str}<br/> </React.Fragment>
            ))}
        </>
    );
}
