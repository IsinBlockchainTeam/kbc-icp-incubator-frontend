type Options = {
    method: string;
    body?: string;
    responseType?: string;
};
export const request = async (
    url: string,
    options: Options,
    contentType = "application/json",
): Promise<any> => {
  const headers = {
    "Content-Type": contentType,
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    // 'Sec-Fetch-Site': 'same-site'
  };

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
