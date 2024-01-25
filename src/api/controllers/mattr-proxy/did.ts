import { request } from "../../../utils/request";
import { requestPath } from "../../../constants";
import { DID } from "../../types/proxy/did";

export const getDidDocument = async (did: string): Promise<DID> => {
  return (await request(
    `${requestPath.MATTR_PROXY_BASE_URL}/did/${did}`,
    { method: "GET" },
  )) as DID;
};
