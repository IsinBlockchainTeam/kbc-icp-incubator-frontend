import { JSONTemplate } from '../JSONTemplate';

export interface JSONOrderTemplate extends JSONTemplate {
    Header: {
        OrderID: string;
        IssueDate: number;
        Description?: string;
        Seller: {
            ID: string; // Unique identifier of a company, i.e. VAT number
            Name: string;
            Address: {
                StreetOne: string;
                PostalCode: string;
                City: string;
                Region: string; // region name with region code
                CountryCode: string;
            };
            Contact: {
                Name: string;
                Surname: string;
                Email: string;
                Phone: string;
            };
        };
        Buyer: {
            ID: string; // Unique identifier of a company, i.e. VAT number
            Name: string;
            Address: {
                StreetOne: string;
                PostalCode: string;
                City: string;
                Region: string; // region name with region code
                CountryCode: string;
            };
            Contact: {
                Name: string;
                Surname: string;
                Email: string;
                Phone: string;
            };
        };
    };
    LineItems: {
        ItemId: string;
        Description: {
            Category: string;
            Typology: string;
            Quality: number;
            MoisturePercent: number;
        };
        QuantitySpecs: {
            Value: number;
            UnitCode: string;
        }[];
        Weight: number; // KGs
        Sample: {
            IsNeeded: boolean;
            Description?: string;
        };
        UnitPrice?: number; // could not be present if the price is defined during the shipment
        Standards: string[]; // i.e. "ISO 9001", "Fair Trade"
    }[];
    Terms: {
        Incoterms: string;
        // TODO: creare una mappa che definisce i termini di insurance a seconda del tipo di incoterms specificato (FOB/FCA o CIF/CFR)
        Insurance: {
            ResponsibleParty: string;
            Details: string;
        };
        Arbiter: {
            ID: string; // Unique identifier of a company, i.e. VAT number
            Name: string;
            Address: {
                StreetOne: string;
                PostalCode: string;
                City: string;
                Region: string; // region name with region code
                CountryCode: string;
            };
            Contact: {
                Name: string;
                Surname: string;
                Email: string;
                Phone: string;
            };
        };
        Shipper: string;
        ShippingPort: string;
        DeliveryPort: string;
        DeliveryDate: number;
        // Tax: {
        //     TypeCode: string; // i.e. "VAT"
        //     RateApplicablePercent: number;
        // };
        Guarantee: {
            AmountPercent: number;
            EscrowTaxPercent: number; // percentage of the guarantee that is paid as platform's fee
        };
        PriceFixing: {
            // if a fixed date is not specified, it must be specified directly the price of the item. One of two fields must be present
            Mode: string; // could be "Seller's Call", "Buyer's Call" or "Forward Contract" (price is defined during the negotiation)
            Value?: string; // in case of the first 2 modes, it is a description that explains the calculation mechanism, otherwise it is not defined (and the price is defined directly in the LineItem)
            PriceSources: string[];
            Currency: string;
            SettlementConditions: string;
        };
    };
    Attachments?: {
        filename: string;
        FileType: string;
        FileContent: string; // i.e. Base64 encoded file
    }[];
    Signatures: {
        BuyerSignature: {
            // initially it will be the name of the employee that has created the contract. After the signature it will be the name of the employee that has signed the contract
            Name: string; // this field is always present. It is the name of the latest employee of the company that has updated the contract
            Surname: string;
            Date?: number;
            TransactionId?: string;
        };
        SellerSignature: {
            // initially it will be the name of the employee that has been engaged with the contract. After the signature it will be the name of the employee that has signed the contract
            Name: string; // this field is always present. It is the name of the latest employee of the company that has updated the contract
            Surname: string;
            Date?: number;
            TransactionId?: string;
        };
    };
    AdditionalInformation?: {
        [key: string]: string;
    };
}
