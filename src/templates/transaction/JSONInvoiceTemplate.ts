import { JSONTemplate } from '../JSONTemplate';

export interface JSONInvoiceTemplate extends JSONTemplate {
    Header: {
        TransactionID: string;
        IssueDate: string;
        Currency: string;
        Status: string;
        Description?: string;
    };
    Totals: {
        TotalTaxAmount: number;
        TotalExclTax: number;
        TotalInclTax: number;
    };
    Taxes: [
        {
            Amount: number;
            TypeCode: string; // i.e. "VAT"
            RateApplicablePercent: number;
        }
    ];
    Seller: {
        ID: string; // Unique identifier of a company, i.e. VAT number
        Name: string;
        Address: {
            StreetOne: string;
            StreetTwo?: string;
            PostalCode: string;
            City: string;
            CountryCode: string;
        };
        Contact: {
            Name: string;
            Email: string;
            Phone: string;
        };
    };
    Buyer: {
        ID: string; // Unique identifier of a company, i.e. VAT number
        Name: string;
        Address: {
            StreetOne: string;
            StreetTwo?: string;
            PostalCode: string;
            City: string;
            CountryCode: string;
        };
        Contact: {
            Name: string;
            Email: string;
            Phone: string;
        };
    };
    LineItems: [
        {
            ItemCode: string;
            Description?: string;
            Quantity: number;
            UnitCode: string;
            UnitPrice: number;
            TotalInclTax: number;
            TotalExclTax: number;
            Tax: {
                Amount: number;
                TypeCode: string; // i.e. "VAT"
                RateApplicablePercent: number;
            };
        }
    ];
    Attachments?: [
        {
            FileName: string;
            FileType: string;
            FileContent: string; // i.e. Base64 encoded file
        }
    ];
    AdditionalInformation?: {
        [key: string]: string;
    };
}
