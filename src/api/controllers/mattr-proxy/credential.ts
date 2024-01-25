import {request} from "../../../utils/request";
import {requestPath} from "../../../constants";

export const create = async (body: { [key: string]: any }): Promise<string> => {
    const payload = {
        name: body.name,
        description: body.description,
        "@context": ["https://schema.org"],
        type: ['Organization'],
        issuer: {
            id: process.env.REACT_APP_ISSUER_DID,
            name: "KBC",
        },
        credentialSubject: {
            id: body.subjectDID,
            legalName: body.subjectName,
        },
        expirationDate: body.expDate
    }

    return await request(`${requestPath.MATTR_PROXY_BASE_URL}/credential/issue`, {
        method: 'POST',
        body: JSON.stringify({payload})
    });
}
