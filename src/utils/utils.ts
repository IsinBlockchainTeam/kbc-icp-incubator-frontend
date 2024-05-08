import { request } from "./request";
import { OrganizationCredential } from "../api/types/OrganizationCredential";
import {ICP} from "../constants";

export const setParametersPath = (
  path = "",
  pathParams: { [key: string]: any },
  queryParams?: { [key: string]: any },
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

export const downloadFile = async (
  path: string,
  filename: string,
  errorMessage: () => void,
) => {
  try {
    const response = await request(
      path,
      {
        method: "GET",
        responseType: "blob",
      },
      undefined,
    );
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.log("error: ", error);
    errorMessage();
  }
};
export const getFileExtension = (filename: string) => {
  const ext = /^.+\.([^.]+)$/.exec(filename);
  return ext == null ? "" : ext[1];
};

export const checkAndGetEnvironmentVariable = (variable: string | undefined, errorMessage?: any): string => {
  if (!variable) throw new Error(errorMessage ? errorMessage : `Environment variable is not defined`);
  return variable;
};

export const moveElementFirstByFieldValue = (
  elementList: any,
  fieldName: string,
  fieldValue: string,
) => {
  elementList.sort((x: any, y: any) => {
    return x[fieldName] === fieldValue
      ? -1
      : y[fieldName] === fieldValue
      ? 1
      : 0;
  });
  return elementList;
};

export const asyncPipe =
  (...fns: any[]) =>
  (x: any) =>
    fns.reduce(async (y, f) => f(await y), x);

export const toTitleCase = (value: string): string => {
  return value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

export const isValueInEnum = (
  value: string | number | null,
  Enum: any,
): boolean => {
  return value !== null ? Object.values(Enum).includes(value) : false;
};

export const getEnumKeyByValue = (
  Enum: any,
  value: number,
): string | undefined => {
  return Object.keys(Enum).find((key) => Enum[key] === value);
};

export const formatDid = (did: string): string => {
  return did.length < 16
    ? did
    : `${did.substring(0, 11)}...${did.substring(did.length - 4, did.length)}`;
};

export const formatClaimName = (claim: string): string => {
  return claim.split("/")[claim.split("/").length - 1];
};

export const formatClaims = (credential: any): OrganizationCredential => {
  const keyMap: { [key: string]: keyof OrganizationCredential } = {
    "http://schema.org/legalName": "legalName",
    "http://schema.org/address": "address",
    "http://schema.org/email": "email",
    "http://schema.org/telephone": "telephone",
    "http://schema.org/image": "image",
  };
  const result: OrganizationCredential = {};

  for (const key in keyMap) {
    if (credential[key]) {
      if (key === "http://schema.org/image") {
        result[keyMap[key]] = credential[key].id;
        continue;
      }
      result[keyMap[key]] = credential[key];
    }
  }

  return result;
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

export const getICPCanisterURL = (canisterId: string): string => {
    const network = checkAndGetEnvironmentVariable(ICP.DFX_NETWORK);
    return network === "local" ? "http" : "https" + "://"
     + checkAndGetEnvironmentVariable(canisterId) + "."
     + network === "local" ? "localhost:4943" : "ic0.app";
}
