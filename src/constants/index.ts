import { checkAndGetEnvironmentVariable } from "../utils/utils";

export const storage = {
  API_TOKEN: "API_TOKEN",
  MATTR_API_TOKEN: "MATTR_API_TOKEN",
  WALLET_ADDRESS: "WALLET_ADDRESS",
  BLOCKCHAIN_VIEW_MODE: "BLOCKCHAIN_VIEW_MODE",
};

export const requestPath = {
  VERAMO_PROXY_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_VERAMO_PROXY_URL, "Veramo proxy URL must be defined")}`,
  MATTR_PROXY_BASE_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_MATTR_PROXY_URL, "Mattr proxy URL must be defined")}/api`,
  BACKEND_BASE_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_BACKEND_URL, "UNECE backend URL must be defined")}/api`,
};

export const contractAddresses = {
    RELATIONSHIP: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_RELATIONSHIP, "Relationship contract address must be defined"),
    MATERIAL: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_MATERIAL, "Material contract address must be defined"),
    TRADE: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_TRADE, "Trade contract address must be defined"),
    TRANSFORMATION: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_TRANSFORMATION, 'Transformation contract address must be defined'),
    DOCUMENT: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_DOCUMENT, "Document contract address must be defined"),
    OFFER: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_OFFER, "Offer contract address must be defined")
}

export const pinataConfiguration = {
  API_KEY: () =>
    checkAndGetEnvironmentVariable(
      process.env.REACT_APP_PINATA_API_KEY,
      "Pinata API key must be defined",
    ),
  SECRET_API_KEY: () =>
    checkAndGetEnvironmentVariable(
      process.env.REACT_APP_PINATA_SECRET_API_KEY,
      "Pinata secret API key must be defined",
    ),
  API_GATEWAY_URL: () =>
    checkAndGetEnvironmentVariable(
      process.env.REACT_APP_PINATA_GATEWAY_URL,
      "Pinata API gateway url must be defined",
    ),
  API_GATEWAY_TOKEN: () =>
    checkAndGetEnvironmentVariable(
      process.env.REACT_APP_PINATA_GATEWAY_TOKEN,
      "Pinata API gateway token must be defined",
    ),
};

export const paths = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CONTRACTS: "/contracts",
  CONTRACT_VIEW: "/contracts/:id",
  ORDERS: "/orders",
  ORDER_VIEW: "/orders/:id",
  SHIPMENTS: "/shipments",
  SHIPMENT_CREATE: "/shipments/create",
  SHIPMENT_VIEW: "/shipments/:id",
  PARTNERS: "/partners",
  OFFERS: "/offers",
  GRAPH: "/graph/:materialId",
  MATERIALS: "/materials",
  TRANSFORMATIONS: "/transformations",
  TRANSFORMATION_VIEW: "/transformations/:id",
  CERTIFICATIONS: "/certifications",
  CERTIFICATION_VIEW: "/certifications/:type/:id",
  TRADES: "/trades",
  TRADE_VIEW: "/trades/:id",
};

export const credentials = {
  PRESENTATION_TEMPLATE_NAME: "credential_request",
  TYPE: "Organization",
};

export const defaultPictureURL: string =
  "https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg";

export const utils = {
  DATE_FORMAT: "DD/MM/YYYY",
};
