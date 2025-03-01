type Message = {
    LOADING: string;
    OK: string;
    ERROR: string;
};

export type ShipmentMessage = Message;
export type OrderMessage = Message;
export type OrganizationMessage = Message;
export type CertificationMessage = Message;
export type AssetOperationMessage = Message;

export const MATERIAL_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving materials...',
        OK: '',
        ERROR: 'Error while retrieving materials.'
    },
    SAVE: {
        LOADING: 'Saving material...',
        OK: 'Material saved successfully.',
        ERROR: 'Error while saving material.'
    }
};
export const PRODUCT_CATEGORY_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving product categories...',
        OK: '',
        ERROR: 'Error while retrieving product categories.'
    },
    SAVE: {
        LOADING: 'Saving product category...',
        OK: 'Product category saved successfully.',
        ERROR: 'Error while saving product category.'
    }
};
export const FIAT_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving fiats...',
        OK: '',
        ERROR: 'Error while retrieving fiats.'
    }
};
export const PROCESS_TYPE_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving process types...',
        OK: '',
        ERROR: 'Error while retrieving process types.'
    }
};
export const UNIT_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving units...',
        OK: '',
        ERROR: 'Error while retrieving units.'
    }
};
export const ASSESSMENT_STANDARD_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving assessment standards...',
        OK: '',
        ERROR: 'Error while retrieving assessment standards.'
    }
};
export const ASSESSMENT_ASSURANCE_LEVEL = {
    RETRIEVE: {
        LOADING: 'Retrieving assessment assurance levels...',
        OK: '',
        ERROR: 'Error while retrieving assessment assurance levels.'
    }
};
export const OFFER_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving offers...',
        OK: '',
        ERROR: 'Error while retrieving offers.'
    },
    SAVE: {
        LOADING: 'Saving offer...',
        OK: 'Offer saved successfully.',
        ERROR: 'Error while saving offer.'
    },
    DELETE: {
        LOADING: 'Deleting offer...',
        OK: 'Offer deleted successfully.',
        ERROR: 'Error while deleting offer.'
    }
};
export const SUPPLIER_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving suppliers...',
        OK: '',
        ERROR: 'Error while retrieving suppliers.'
    },
    SAVE: {
        LOADING: 'Saving supplier...',
        OK: 'Supplier saved successfully.',
        ERROR: 'Error while saving supplier.'
    }
};
export const NAME_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving names...',
        OK: '',
        ERROR: 'Error while retrieving names.'
    }
};
export const RELATIONSHIP_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving relationships...',
        OK: '',
        ERROR: 'Error while retrieving relationships.'
    }
};
export const RAW_TRADE_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving raw trades...',
        OK: '',
        ERROR: 'Error while retrieving raw trades.'
    }
};
export const BASIC_TRADE_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving basic trade...',
        OK: '',
        ERROR: 'Error while retrieving basic trade.'
    },
    SAVE: {
        LOADING: 'Creating basic trade...',
        OK: 'The basic trade has been created.',
        ERROR: 'Error while creating basic trade.'
    },
    UPDATE: {
        LOADING: 'Updating basic trade...',
        OK: 'The basic trade has been updated.',
        ERROR: 'Error while updating basic trade.'
    }
};
export const ASSET_OPERATION_MESSAGE = {
    RETRIEVE_MANY: {
        LOADING: 'Retrieving asset operations...',
        OK: '',
        ERROR: 'Error while retrieving asset operations.'
    },
    RETRIEVE: {
        LOADING: 'Retrieving asset operation...',
        OK: '',
        ERROR: 'Error while retrieving asset operation.'
    },
    SAVE: {
        LOADING: 'Creating asset operation...',
        OK: 'The asset operation has been created.',
        ERROR: 'Error while creating asset operation.'
    },
    UPDATE: {
        LOADING: 'Updating asset operation...',
        OK: 'The asset operation has been updated.',
        ERROR: 'Error while updating asset operation.'
    },
    DELETE: {
        LOADING: 'Deleting asset operation...',
        OK: 'The asset operation has been deleted.',
        ERROR: 'Error while deleting asset operation.'
    }
};
export const ORDER_TRADE_MESSAGE = {
    RETRIEVE_MANY: {
        LOADING: 'Retrieving order trades...',
        OK: '',
        ERROR: 'Error while retrieving order trades.'
    },
    RETRIEVE: {
        LOADING: 'Retrieving order trade...',
        OK: '',
        ERROR: 'Error while retrieving order trade.'
    },
    SAVE: {
        LOADING: 'Creating order trade...',
        OK: 'The order trade has been created.',
        ERROR: 'Error while creating order trade.'
    },
    UPDATE: {
        LOADING: 'Updating order trade...',
        OK: 'The order trade has been updated.',
        ERROR: 'Error while updating order trade.'
    },
    CONFIRM_NEGOTIATION: {
        LOADING: 'Confirming negotiation...',
        OK: 'The negotiation has been confirmed.',
        ERROR: 'Error while confirming negotiation.'
    },
    NOTIFY_EXPIRATION: {
        LOADING: 'Notifying expiration...',
        OK: 'The expiration has been notified.',
        ERROR: 'Error while notifying expiration.'
    }
};
export const RAW_CERTIFICATION_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving raw certifications...',
        OK: '',
        ERROR: 'Error while retrieving raw certifications.'
    }
};
export const CERTIFICATION_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving certification...',
        OK: '',
        ERROR: 'Error while retrieving certification.'
    },
    SAVE: {
        LOADING: 'Creating certification...',
        OK: 'The certification has been created.',
        ERROR: 'Error while creating certification.'
    },
    UPDATE: {
        LOADING: 'Updating certification...',
        OK: 'The certification has been updated.',
        ERROR: 'Error while updating certification.'
    }
};
export const DOCUMENT_MESSAGE = {
    UPLOAD: {
        LOADING: 'Uploading document...',
        OK: 'The document has been successfully uploaded.',
        ERROR: 'Error while uploading document.'
    },
    VALIDATE: {
        LOADING: 'Validating document...',
        APPROVED: 'The document has been successfully approved.',
        REJECTED: 'The document has been successfully rejected.',
        ERROR: 'Error while validating document.'
    }
};
export const ACTION_MESSAGE = {
    NO_ACTION: '',
    SIGNATURE_REQUIRED: 'This negotiation needs your sign to proceed.',
    UPLOAD_REQUIRED: 'You have to upload some documents.',
    VALIDATION_REQUIRED: 'This negotiation needs your sign to proceed.'
};
export const GRAPH_MESSAGE = {
    COMPUTE: {
        LOADING: 'Computing graph...',
        OK: '',
        ERROR: 'Error while computing graph.'
    }
};
export const COMPANY_MESSAGE = {
    INVITE: {
        LOADING: 'Inviting company...',
        OK: 'Company invited successfully.',
        ERROR: 'Error while inviting company.'
    }
};
export const LOGIN_MESSAGE = {
    COMPUTE: {
        LOADING: 'Logging in...',
        OK: '',
        ERROR: 'Error while logging in.'
    }
};
export const AUTHENTICATION_MESSAGE = {
    AUTHENTICATE: {
        LOADING: 'Verifying permissions...',
        OK: '',
        ERROR: 'Error while verifying permissions.'
    },
    REFRESH: {
        LOADING: 'Refreshing permissions...',
        OK: '',
        ERROR: 'Error while refreshing permissions.'
    },
    LOGOUT: {
        LOADING: 'Logging out...',
        OK: '',
        ERROR: 'Error while logging out.'
    }
};
export const DOWN_PAYMENT_MESSAGE = {
    DEPOSIT: {
        LOADING: 'Depositing funds...',
        OK: 'Funds deposited successfully.',
        ERROR: 'Error while depositing funds.'
    },
    LOCK: {
        LOADING: 'Locking funds...',
        OK: 'Funds locked successfully.',
        ERROR: 'Error while locking funds.'
    },
    UNLOCK: {
        LOADING: 'Unlocking funds...',
        OK: 'Funds unlocked successfully.',
        ERROR: 'Error while unlocking funds.'
    },
    RETRIEVE: {
        LOADING: 'Retrieving down payment details...',
        OK: '',
        ERROR: 'Error while retrieving down payment details.'
    },
    WITHDRAW: {
        LOADING: 'Withdrawing...',
        OK: 'Withdrawal successful.',
        ERROR: 'Error while withdrawing.'
    }
};
export const TOKEN_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving token details...',
        OK: '',
        ERROR: 'Error while retrieving token details.'
    }
};
export const SHIPMENT_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving shipment...',
        OK: '',
        ERROR: 'Error while retrieving shipment.'
    },
    SAVE_DETAILS: {
        LOADING: 'Saving shipment details...',
        OK: 'Shipment details saved successfully.',
        ERROR: 'Error while saving shipment details.'
    },
    APPROVE_SAMPLE: {
        LOADING: 'Approving shipment sample...',
        OK: 'Shipment sample approved successfully.',
        ERROR: 'Error while approving shipment sample.'
    },
    REJECT_SAMPLE: {
        LOADING: 'Rejecting shipment sample...',
        OK: 'Shipment sample rejected successfully.',
        ERROR: 'Error while rejecting shipment sample.'
    },
    APPROVE_DETAILS: {
        LOADING: 'Approving shipment details...',
        OK: 'Shipment details approved successfully.',
        ERROR: 'Error while approving shipment details.'
    },
    REJECT_DETAILS: {
        LOADING: 'Rejecting shipment details...',
        OK: 'Shipment details rejected successfully.',
        ERROR: 'Error while rejecting shipment details.'
    },
    APPROVE_QUALITY: {
        LOADING: 'Approving shipment quality...',
        OK: 'Shipment quality approved successfully.',
        ERROR: 'Error while approving shipment quality.'
    },
    REJECT_QUALITY: {
        LOADING: 'Rejecting shipment quality...',
        OK: 'Shipment quality rejected successfully.',
        ERROR: 'Error while rejecting shipment quality.'
    },
    DETERMINE_DOWN_PAYMENT: {
        LOADING: 'Determining down payment...',
        OK: 'Down payment determined successfully.',
        ERROR: 'Error while determining down payment.'
    },
    GET_DOCUMENT: {
        LOADING: 'Retrieving document...',
        OK: '',
        ERROR: 'Error while retrieving document.'
    },
    ADD_DOCUMENT: {
        LOADING: 'Adding document...',
        OK: 'Document added successfully.',
        ERROR: 'Error while adding document.'
    },
    APPROVE_DOCUMENT: {
        LOADING: 'Approving document...',
        OK: 'Document approved successfully.',
        ERROR: 'Error while approving document.'
    },
    REJECT_DOCUMENT: {
        LOADING: 'Rejecting document...',
        OK: 'Document rejected successfully.',
        ERROR: 'Error while rejecting document.'
    },
    CONFIRM: {
        LOADING: 'Confirming shipment...',
        OK: 'Shipment confirmed successfully.',
        ERROR: 'Error while confirming shipment.'
    },
    START_ARBITRATION: {
        LOADING: 'Starting arbitration...',
        OK: 'Arbitration started successfully.',
        ERROR: 'Error while starting arbitration.'
    }
};
export const ORGANIZATION_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving organizations...',
        OK: '',
        ERROR: 'Error while retrieving organizations.',
        NOT_FOUND: 'Organization not found'
    },
    SAVE: {
        LOADING: 'Saving organization...',
        OK: 'Organization saved successfully.',
        ERROR: 'Error while saving organization.'
    },
    UPDATE: {
        LOADING: 'Updating organization...',
        OK: 'The organization has been updated.',
        ERROR: 'Error while updating organization.'
    },
    INVITE: {
        LOADING: 'Inviting organization...',
        OK: 'Organization invited successfully.',
        ERROR: 'Error while inviting organization.'
    }
};
export const BUSINESS_RELATION_MESSAGE = {
    RETRIEVE: {
        LOADING: 'Retrieving business relations...',
        OK: '',
        ERROR: 'Error while retrieving business relations.'
    },
    SAVE: {
        LOADING: 'Disclosing information...',
        OK: 'Information disclosed successfully.',
        ERROR: 'Error while disclosing information.'
    }
};
