import { checkAndGetEnvironmentVariable } from "../utils/utils";

export const storage = {
  UNECE_API_TOKEN: "UNECE_API_TOKEN",
  SOLID_API_TOKEN: "SOLID_API_TOKEN",
  MATTR_API_TOKEN: "MATTR_API_TOKEN",
  WALLET_ADDRESS: "WALLET_ADDRESS",
  BLOCKCHAIN_VIEW_MODE: "BLOCKCHAIN_VIEW_MODE",
};

export const requestPath = {
  MATTR_PROXY_BASE_URL: `${process.env.REACT_APP_LOCAL_DEV ? checkAndGetEnvironmentVariable(process.env.REACT_APP_MATTR_PROXY_URL, "Mattr proxy URL must be defined") : '/mattr'}/api`,
  BC_SYNC_BASE_URL: `${process.env.REACT_APP_BC_SYNC_URL ? checkAndGetEnvironmentVariable(process.env.REACT_APP_BC_SYNC_URL, "Blockchain sync URL must be defined") : '/bcsync'}/api`,
  BACKEND_BASE_URL: `${process.env.REACT_APP_LOCAL_DEV ? checkAndGetEnvironmentVariable(process.env.REACT_APP_BACKEND_URL, "UNECE backend URL must be defined") : '/unece'}/api`,
};

export const contractAddresses = {
  PRODUCT_CATEGORY: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_PRODUCT_CATEGORY, "Product category contract address must be defined"),
    RELATIONSHIP: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_RELATIONSHIP, "Relationship contract address must be defined"),
    MATERIAL: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_MATERIAL, "Material contract address must be defined"),
    TRADE: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_TRADE, "Trade contract address must be defined"),
    ASSET_OPERATION: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_ASSET_OPERATION, 'Transformation contract address must be defined'),
    DOCUMENT: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_DOCUMENT, "Document contract address must be defined"),
    OFFER: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_OFFER, "Offer contract address must be defined")
}

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
