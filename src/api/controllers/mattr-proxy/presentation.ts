import { request } from "../../../utils/request";
import { credentials, requestPath } from "../../../constants";
import {
  PresentationRequest,
  PresentationTemplate,
} from "../../types/proxy/presentation";

export const getTemplate = async (): Promise<PresentationTemplate> => {
  let resp = await request(
    `${requestPath.MATTR_PROXY_BASE_URL}/presentation/templates`,
    { method: "GET" },
  );
  const credentialTemplates = resp.map((data: any) => data as PresentationTemplate) as PresentationTemplate[];
  let template = credentialTemplates.find(
    (t) => t.name === credentials.PRESENTATION_TEMPLATE_NAME,
  );

  if (!template) {
    template = (await request(
      `${requestPath.MATTR_PROXY_BASE_URL}/presentation/templates`,
      {
        method: "POST",
        body: JSON.stringify({
          templateName: credentials.PRESENTATION_TEMPLATE_NAME,
          credentialType: credentials.TYPE,
        }),
      },
    )) as PresentationTemplate;
  }
  return template;
};

export const createRequest = async (
  challengeId: string,
  templateId: string,
): Promise<PresentationRequest> => {
  return (await request(
    `${requestPath.MATTR_PROXY_BASE_URL}/presentation/requests`,
    {
      method: "POST",
      body: JSON.stringify({
        challenge: challengeId,
        templateId: templateId,
      }),
    },
  )) as PresentationRequest;
};
