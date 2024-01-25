import {request} from "../../../utils/request";
import {requestPath} from "../../../constants";

type MattrAPIToken = {
    access_token: string,
    expires_in: number,
    token_type: string
}

export const login = async () => {
    return await request(
        `${requestPath.MATTR_PROXY_BASE_URL}/authentication`,
        {
            method: 'POST', body: JSON.stringify({
                client_id: process.env.REACT_APP_MATTR_CLIENT_ID,
                client_secret: process.env.REACT_APP_MATTR_CLIENT_SECRET,
                audience: "https://vii.mattr.global",
                grant_type: "client_credentials"
            })
        }
    ) as MattrAPIToken;
}
