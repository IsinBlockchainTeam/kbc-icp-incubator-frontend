import { request } from "../../../utils/request";
import { requestPath } from "../../../constants";

export const sign = async (didUrl: string, message: any): Promise<string> => {
  return await request(
    `${requestPath.MATTR_PROXY_BASE_URL}/messaging/sign`,
    {
      method: "POST",
      body: JSON.stringify({
        didUrl: didUrl,
        payload: message,
      }),
    },
    undefined,
  );
};
