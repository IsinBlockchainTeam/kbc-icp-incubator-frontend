import { checkAndGetEnvironmentVariable } from "../utils/utils";

export const storage = {
  WALLET_ADDRESS: "WALLET_ADDRESS",
};

export const requestPath = {
  VERIFIER_BACKEND_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_VERIFIER_BACKEND_URL, "Veramo proxy URL must be defined")}/api/verifier`,
  EMAIL_SENDER_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_EMAIL_SENDER_URL, "Email sender service URL must be defined")}`,
};

export const RPC_URL = checkAndGetEnvironmentVariable(process.env.REACT_APP_RPC_URL, "RPC URL must be defined");

export const contractAddresses = {
    PROCESS_TYPE: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_PROCESS_TYPE, "Process type contract address must be defined"),
    ASSESSMENT_STANDARD: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_ASSESSMENT_STANDARD, "Assessment standard contract address must be defined"),
    PRODUCT_CATEGORY: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_PRODUCT_CATEGORY, "Product category contract address must be defined"),
    RELATIONSHIP: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_RELATIONSHIP, "Relationship contract address must be defined"),
    MATERIAL: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_MATERIAL, "Material contract address must be defined"),
    TRADE: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_TRADE, "Trade contract address must be defined"),
    ASSET_OPERATION: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_ASSET_OPERATION, 'Transformation contract address must be defined'),
    DOCUMENT: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_DOCUMENT, "Document contract address must be defined"),
    OFFER: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_CONTRACT_OFFER, "Offer contract address must be defined")
}

export const ICP = {
    DFX_NETWORK: checkAndGetEnvironmentVariable(process.env.DFX_NETWORK, "DFX network must be defined"),
    CANISTER_ID_STORAGE: checkAndGetEnvironmentVariable(process.env.REACT_APP_CANISTER_ID_STORAGE, "Storage canister ID must be defined"),
    CANISTER_ID_PROFILE: checkAndGetEnvironmentVariable(process.env.REACT_APP_CANISTER_ID_PROFILE, "Profile canister ID must be defined"),
    CANISTER_ID_PERMISSION: checkAndGetEnvironmentVariable(process.env.REACT_APP_CANISTER_ID_PERMISSION, "Permission canister ID must be defined"),
    CANISTER_ID_ORGANIZATION: checkAndGetEnvironmentVariable(process.env.REACT_APP_CANISTER_ID_ORGANIZATION, "Organization canister ID must be defined"),
    CANISTER_ID_INTERNET_IDENTITY: checkAndGetEnvironmentVariable(process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY, "Internet identity canister ID must be defined"),
}

export const paths = {
    HOME: "/",
    PROFILE: "/profile",
    LOGIN: "/login",
    CONTRACTS: "/contracts",
    CONTRACT_VIEW: "/contracts/:id",
    ORDERS: "/orders",
    ORDER_VIEW: "/orders/:id",
    SHIPMENTS: "/shipments",
    SHIPMENT_CREATE: "/shipments/create",
    SHIPMENT_VIEW: "/shipments/:id",
    PARTNERS: "/partners",
    OFFERS: "/offers",
    OFFERS_NEW: "/offers/new",
    OFFERS_SUPPLIER_NEW: "/offers/supplier/new",
    GRAPH: "/graph/:materialId",
    MATERIALS: "/materials",
    MATERIAL_NEW: "/materials/new",
    PRODUCT_CATEGORY_NEW: "/product-categories/new",
    ASSET_OPERATIONS: "/asset-operations",
    ASSET_OPERATIONS_NEW: "/asset-operations/new",
    TRANSFORMATION_VIEW: "/transformations/:id",
    CERTIFICATIONS: "/certifications",
    CERTIFICATION_VIEW: "/certifications/:type/:id",
    TRADES: "/trades",
    TRADE_NEW: "/trades/new",
    TRADE_VIEW: "/trades/:id",
};

export const credentials = {
    PRESENTATION_TEMPLATE_NAME: "credential_request",
    TYPE: "Organization",
    ROLE_EXPORTER: "EXPORTER",
    ROLE_IMPORTER: "IMPORTER",
};

export const defaultPictureURL: string =
  "https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg";

export const utils = {
  DATE_FORMAT: "DD/MM/YYYY",
};
