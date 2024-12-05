import { useCallback } from 'react';
import { JSONOrderTemplate } from '../../templates/transaction/JSONOrderTemplate';
import { incotermsMap } from '@/constants/trade';
import { text, image, barcodes } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import OrderTemplateSchema from '../../templates/transaction/pdf-schemas/OrderTemplateSchema.json';
import { DOWN_PAYMENT_FEE } from '@/constants/misc';
import { fixYPositions } from '@/hooks/documentGenerator/utils';
import { useOrganization } from '@/providers/icp/OrganizationProvider';
import { BroadedOrganization } from '@kbc-lib/coffee-trading-management-lib';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const incotermsKeys = Array.from(incotermsMap.keys());

export type OrderSpec = {
    id: string;
    issueDate: number;
    supplierAddress: string;
    commissionerAddress: string;
    currency: string;
    items: {
        id: string;
        productCategory: string;
        productTypology: string;
        quality: number;
        moisture: number;
        quantitySpecs: {
            value: number;
            unitCode: string;
        }[];
        weight: number;
        sample: {
            isNeeded: boolean;
            description?: string;
        };
        price?: number;
        standards: string[];
    }[];
    constraints: {
        incoterms: (typeof incotermsKeys)[number];
        guaranteePercentage: number;
        arbiterAddress: string;
        shipper: string;
        shippingPort: string;
        deliveryPort: string;
        deliveryDate: number;
        otherConditions?: string;
    };
};

export default (
    orderSpec: OrderSpec
): {
    generateJsonSpec: () => JSONOrderTemplate;
    generatePdf: () => Promise<Blob>;
} => {
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const { getOrganization } = useOrganization();

    const { employeeClaims } = userInfo;

    const getSigner = (companyEthAddress: string) => {
        return {
            name: employeeClaims.firstName,
            lastname: employeeClaims.lastName,
            telephone: employeeClaims.telephone,
            email: employeeClaims.email
        };
    };

    const generateJsonSpec = useCallback((): JSONOrderTemplate => {
        const supplier = getOrganization(orderSpec.supplierAddress) as BroadedOrganization;
        const commissioner = getOrganization(orderSpec.commissionerAddress) as BroadedOrganization;
        // FIXME: Think better what can be the arbiter
        // const arbiter = getOrganization(
        //     orderSpec.constraints.arbiterAddress
        // ) as BroadedOrganization;

        // TODO: probabilmente le informazioni dell'employee e/o della company verranno recuperate in un altro modo o in maniera "collegata" tra loro
        const supplierContact = getSigner(orderSpec.supplierAddress);
        const commissionerContact = getSigner(orderSpec.commissionerAddress);
        const arbiterContact = getSigner(orderSpec.constraints.arbiterAddress);

        return {
            Header: {
                OrderID: orderSpec.id,
                IssueDate: orderSpec.issueDate,
                Seller: {
                    ID: supplier.ethAddress,
                    Name: supplier.legalName,
                    Address: {
                        StreetOne: supplier.address,
                        PostalCode: supplier.postalCode,
                        City: supplier.city,
                        Region: supplier.region,
                        CountryCode: supplier.countryCode
                    },
                    Contact: {
                        Name: supplierContact.name,
                        Surname: supplierContact.lastname,
                        Email: supplierContact.email,
                        Phone: supplierContact.telephone
                    }
                },
                Buyer: {
                    ID: commissioner.ethAddress,
                    Name: commissioner.legalName,
                    Address: {
                        StreetOne: commissioner.address,
                        PostalCode: commissioner.postalCode,
                        Region: commissioner.region,
                        City: commissioner.city,
                        CountryCode: commissioner.countryCode
                    },
                    Contact: {
                        Name: commissionerContact.name,
                        Surname: commissionerContact.lastname,
                        Email: commissionerContact.email,
                        Phone: commissionerContact.telephone
                    }
                }
            },
            LineItems: orderSpec.items.map((item) => ({
                ItemId: item.id,
                Description: {
                    Category: item.productCategory,
                    Typology: item.productTypology,
                    Quality: item.quality,
                    MoisturePercent: item.moisture
                },
                QuantitySpecs: item.quantitySpecs.map((spec) => ({
                    Value: spec.value,
                    UnitCode: spec.unitCode
                })),
                Weight: item.weight,
                Sample: {
                    IsNeeded: item.sample.isNeeded,
                    Description: item.sample.description
                },
                UnitPrice: item.price,
                Standards: []
            })),
            Terms: {
                Incoterms: orderSpec.constraints.incoterms,
                Insurance: {
                    ResponsibleParty: incotermsMap.get(orderSpec.constraints.incoterms)!.responsibleParty,
                    Details: incotermsMap.get(orderSpec.constraints.incoterms)!.details
                },
                Arbiter: {
                    // ID: arbiter.ethAddress,
                    // Name: arbiter.legalName,
                    // Address: {
                    //     StreetOne: arbiter.address,
                    //     PostalCode: arbiter.postalCode,
                    //     Region: arbiter.region,
                    //     City: arbiter.city,
                    //     CountryCode: arbiter.countryCode
                    // },
                    ID: '0x3EDe384424990E429d5C58522E899A56094A048F',
                    Name: 'Chester Myers',
                    Address: {
                        StreetOne: 'Ap #606-7666 Morbi St.',
                        PostalCode: '067368',
                        Region: 'South Island',
                        City: 'Sankt Johann im Pongau',
                        CountryCode: 'MX'
                    },
                    Contact: {
                        Name: arbiterContact.name,
                        Surname: arbiterContact.lastname,
                        Email: arbiterContact.email,
                        Phone: arbiterContact.telephone
                    }
                },
                Shipper: orderSpec.constraints.shipper,
                ShippingPort: orderSpec.constraints.shippingPort,
                DeliveryPort: orderSpec.constraints.deliveryPort,
                DeliveryDate: orderSpec.constraints.deliveryDate,
                Guarantee: {
                    AmountPercent: orderSpec.constraints.guaranteePercentage,
                    DownPaymentTaxPercent: DOWN_PAYMENT_FEE
                },
                PriceFixing: {
                    Mode: "Seller's Call",
                    Value: 'Average of daily closing prices from the previous month',
                    Currency: orderSpec.currency,
                    // TODO: remove this hardcoded values
                    PriceSources: ['New York Mercantile Exchange (NYMEX)', 'London Metal Exchange (LME)'],
                    SettlementConditions: 'Payment due within 30 days of price fixing date'
                }
            },
            Signatures: {
                // TODO: these signatures will refer to the actual employee that has signed the negotiation and after the document is ready, the two signs will be updated with the signatures of the employee of the responsible office
                BuyerSignature: {
                    Name: commissionerContact.name,
                    Surname: commissionerContact.lastname
                },
                SellerSignature: {
                    Name: supplierContact.name,
                    Surname: supplierContact.lastname
                }
            },
            AdditionalInformation: {
                ...(orderSpec.constraints.otherConditions && {
                    OtherConditions: orderSpec.constraints.otherConditions
                })
            }
        };
    }, []);

    const generatePdf = useCallback(async (): Promise<Blob> => {
        const jsonSpec: JSONOrderTemplate = generateJsonSpec();
        const plugins = { text, image, qrcode: barcodes.qrcode };
        const inputs = [
            {
                sellerLegalName: jsonSpec.Header.Seller.Name,
                sellerContactName: jsonSpec.Header.Seller.Contact.Name,
                sellerPhoneNumber: jsonSpec.Header.Seller.Contact.Phone,
                orderID: jsonSpec.Header.OrderID,
                itemQuantity1: String(jsonSpec.LineItems[0].QuantitySpecs[0].Value),
                itemUnit1: jsonSpec.LineItems[0].QuantitySpecs[0].UnitCode,
                itemWeight: String(jsonSpec.LineItems[0].Weight),
                priceMode: jsonSpec.Terms.PriceFixing.Mode,
                currency: jsonSpec.Terms.PriceFixing.Currency,
                downPaymentPercentage: `${jsonSpec.Terms.Guarantee.DownPaymentTaxPercent}%`,
                downPaymentTaxPercentage: `${jsonSpec.Terms.Guarantee.AmountPercent}%`,
                arbiter: jsonSpec.Terms.Arbiter.Name,
                shipper: jsonSpec.Terms.Shipper,
                shippingPort: jsonSpec.Terms.ShippingPort,
                deliveryDate: new Date(jsonSpec.Terms.DeliveryDate * 1000).toLocaleDateString(),
                deliveryPort: jsonSpec.Terms.DeliveryPort,
                sampleYes: jsonSpec.LineItems[0].Sample.IsNeeded ? 'X' : '',
                sampleNo: !jsonSpec.LineItems[0].Sample.IsNeeded ? 'X' : '',
                sellerAddress: jsonSpec.Header.Seller.Address.StreetOne,
                sellerCity: `${jsonSpec.Header.Seller.Address.PostalCode} - ${jsonSpec.Header.Seller.Address.City}`,
                sellerEmail: jsonSpec.Header.Seller.Contact.Email,
                buyerLegalName: jsonSpec.Header.Buyer.Name,
                buyerContactName: jsonSpec.Header.Buyer.Contact.Name,
                buyerPhoneNumber: jsonSpec.Header.Buyer.Contact.Phone,
                buyerAddress: jsonSpec.Header.Buyer.Address.StreetOne,
                buyerCity: `${jsonSpec.Header.Buyer.Address.PostalCode} - ${jsonSpec.Header.Buyer.Address.City}`,
                buyerEmail: jsonSpec.Header.Buyer.Contact.Email,
                itemCategory: jsonSpec.LineItems[0].Description.Category,
                itemTypology: jsonSpec.LineItems[0].Description.Typology,
                itemQuality: String(jsonSpec.LineItems[0].Description.Quality),
                itemMoisture: `${jsonSpec.LineItems[0].Description.MoisturePercent}%`,
                priceValue: jsonSpec.Terms.PriceFixing.Value,
                insuranceResponsible: incotermsMap.get(jsonSpec.Terms.Incoterms)?.responsibleParty,
                insuranceDetails: incotermsMap.get(jsonSpec.Terms.Incoterms)?.details,
                issueDate: new Date(jsonSpec.Header.IssueDate).toLocaleDateString(),
                priceCondition: jsonSpec.Terms.PriceFixing.SettlementConditions,
                sellerRegion: jsonSpec.Header.Seller.Address.Region,
                buyerRegion: jsonSpec.Header.Buyer.Address.Region,
                itemQuantity2: String(jsonSpec.LineItems[0].QuantitySpecs[1].Value),
                itemUnit2: jsonSpec.LineItems[0].QuantitySpecs[1].UnitCode,
                incoterms: jsonSpec.Terms.Incoterms,
                standards: jsonSpec.LineItems[0].Standards.join(', '),
                sampleDescription: jsonSpec.LineItems[0].Sample.Description,
                otherConditions: jsonSpec.AdditionalInformation?.OtherConditions || 'None'
            }
        ];

        // const blob = new Blob(
        //     [
        //         (
        //             await generate({
        //                 template: {
        //                     ...OrderTemplateSchema,
        //                     schemas: fixYPositions(OrderTemplateSchema.schemas)
        //                 },
        //                 inputs,
        //                 plugins
        //             })
        //         ).buffer
        //     ],
        //     { type: 'application/pdf' }
        // );
        // window.open(URL.createObjectURL(blob));
        return new Blob(
            [
                (
                    await generate({
                        template: {
                            ...OrderTemplateSchema,
                            schemas: fixYPositions(OrderTemplateSchema.schemas)
                        },
                        inputs,
                        plugins
                    })
                ).buffer
            ],
            { type: 'application/pdf' }
        );
    }, []);

    return {
        generateJsonSpec,
        generatePdf
    };
};
