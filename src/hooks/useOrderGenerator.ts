import { useCallback } from 'react';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { OrderExported } from '../templates/transaction/OrderExported';
import { VAT_TAX } from '@/constants/misc';
import { incotermsMap } from '@/constants/trade';

const incotermsKeys = Array.from(incotermsMap.keys());

export type OrderSpec = {
    id: string;
    supplierAddress: string;
    commissionerAddress: string;
    issueDate: Date;
    fiat: string;
    items: {
        id: string;
        productCategory: string;
        quality: number;
        quantity: number;
        weight: number;
        unitCode: string;
        price: number;
    }[];
    constraints: {
        incoterms: (typeof incotermsKeys)[number];
        governingLaw: string;
        arbiterAddress: string;
        shipper: string;
        shippingPort: string;
        deliveryPort: string;
        paymentDeadline: Date;
        documentDeadline: Date;
        shippingDeadline: Date;
        deliveryDeadline: Date;
    };
};

// TODO: una volta ricavate le informazioni complete delle compagnie partner, posso andare a creare l'oggetto json standard per le fatture (su discord) insieme alle altre informazioni negoziate
// ora ICP non ritornerà più solamente il nome della compagnia ma anche le altre informazioni che mi servono
export default () => {
    const { getOrganization } = useICPOrganization();

    const generateJsonSpec = useCallback((orderSpec: OrderSpec): OrderExported => {
        const supplier = getOrganization(orderSpec.supplierAddress);
        const commissioner = getOrganization(orderSpec.commissionerAddress);
        const arbiter = getOrganization(orderSpec.constraints.arbiterAddress);

        return {
            Header: {
                ContractID: orderSpec.id,
                IssueDate: orderSpec.issueDate.toISOString(),
                Seller: {
                    ID: supplier.id,
                    Name: supplier.legalName,
                    Address: {
                        StreetOne: supplier.address,
                        PostalCode: supplier.postalCode,
                        City: supplier.city,
                        CountryCode: supplier.countryCode
                    },
                    Contact: {
                        Name: supplier.legalName,
                        Email: supplier.email,
                        Phone: supplier.telephone
                    }
                },
                Buyer: {
                    ID: commissioner.id,
                    Name: commissioner.legalName,
                    Address: {
                        StreetOne: commissioner.address,
                        PostalCode: commissioner.postalCode,
                        City: commissioner.city,
                        CountryCode: commissioner.countryCode
                    },
                    Contact: {
                        Name: commissioner.legalName,
                        Email: commissioner.email,
                        Phone: commissioner.telephone
                    }
                }
            },
            LineItems: orderSpec.items.map((item) => ({
                ItemId: item.id,
                Description: item.productCategory,
                Quality: item.quality,
                Quantity: item.quantity,
                Weight: item.weight,
                UnitCode: item.unitCode,
                UnitPrice: item.price ? item.price / item.quantity : undefined,
                Standards: []
            })),
            Terms: {
                Incoterms: orderSpec.constraints.incoterms,
                Insurance: {
                    ResponsibleParty: incotermsMap.get(orderSpec.constraints.incoterms)!
                        .responsibleParty,
                    Details: incotermsMap.get(orderSpec.constraints.incoterms)!.details
                },
                Arbiter: {
                    ID: arbiter.id,
                    Name: arbiter.legalName,
                    Address: {
                        StreetOne: arbiter.address,
                        PostalCode: arbiter.postalCode,
                        City: arbiter.city,
                        CountryCode: arbiter.countryCode
                    },
                    Contact: {
                        Name: arbiter.legalName,
                        Email: arbiter.email,
                        Phone: arbiter.telephone
                    },
                    GoverningLaw: orderSpec.constraints.governingLaw
                },
                Shipper: orderSpec.constraints.shipper,
                ShippingPort: orderSpec.constraints.shippingPort,
                DeliveryPort: orderSpec.constraints.deliveryPort,
                Tax: {
                    TypeCode: 'VAT',
                    RateApplicablePercent: VAT_TAX
                },
                PriceFixing: {
                    FixedPrice: orderSpec.items.reduce((acc, item) => acc + item.price, 0),
                    Currency: orderSpec.fiat,
                    // TODO: remove this hardcoded values
                    PriceSources: [
                        'New York Mercantile Exchange (NYMEX)',
                        'London Metal Exchange (LME)'
                    ],
                    SettlementConditions: 'Payment due within 30 days of price fixing date'
                }
            },
            Signatures: {
                // TODO: these signatures will refer to the actual employee that has signed the negotiation and after the document is ready, the two signs will be updated with the signatures of the employee of the responsible office
                BuyerSignature: {
                    Name: commissioner.legalName
                },
                SellerSignature: {
                    Name: supplier.legalName
                }
            }
        };
    }, []);

    return {
        generateJsonSpec
    };
};
