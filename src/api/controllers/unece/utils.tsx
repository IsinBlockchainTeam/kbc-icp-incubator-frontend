import {Configuration} from "@unece/cotton-fetch";
import {getAPIToken} from "../../../utils/storage";
import {requestPath} from "../../../constants";

function my_pre(context: any): Promise<void> {
    const accessToken = getAPIToken();
    if(accessToken){
        context.init.headers['Authorization'] = 'Bearer ' + accessToken;
    }
    return Promise.resolve();
}

function my_post(context: any): Promise<void> {
    return Promise.resolve();
}

const configuration = new Configuration({
    basePath: requestPath.BACKEND_BASE_URL,
    middleware: [{
        pre: my_pre,
        post:my_post
    }],
    headers: {
        'Sec-Fetch-Site': 'same-site'
    }
});

export default configuration;
