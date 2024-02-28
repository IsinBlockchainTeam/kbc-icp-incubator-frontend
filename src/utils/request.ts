import { getAPIToken, getMattrAPIToken } from "./storage";

export const request = async (
  url: string,
  options: any,
  contentType = "application/json"
): Promise<any> => {
  let headers = {
    "Content-Type": contentType,
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    // 'Sec-Fetch-Site': 'same-site'
  };

  if (getMattrAPIToken()) {
    // @ts-ignore
    headers = {
      ...headers,
      // @ts-ignore
      "x-api-token-info": getMattrAPIToken(),
    };
  }
  if (getAPIToken()) {
    // @ts-ignore
    headers = {
      ...headers,
      // @ts-ignore
      Authorization: "Bearer " + getAPIToken(),
    };
  }
  // options = {
  //     method: "GET",
  //     mode: 'no-cors',
  //     headers: headers
  // }
  options = Object.assign({}, { headers }, options);

  const response = await fetch(url, options);
  if (options.responseType === "blob") return await response.blob();

  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (error) {
    return responseText;
  }
};
