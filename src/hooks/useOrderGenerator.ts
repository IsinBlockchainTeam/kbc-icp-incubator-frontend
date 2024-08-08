import { useCallback } from 'react';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { JSONOrderTemplate } from '../templates/transaction/JSONOrderTemplate';
import { VAT_TAX } from '@/constants/misc';
import { incotermsMap } from '@/constants/trade';
import { text, image, barcodes } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import OrderTemplateSchema from '../templates/transaction/pdf-schemas/OrderTemplateSchema.json';

const incotermsKeys = Array.from(incotermsMap.keys());

export type OrderSpec = {
    id: string;
    issueDate: Date;
    supplierAddress: string;
    commissionerAddress: string;
    currency: string;
    items: {
        id: string;
        productCategory: string;
        productTypology: string;
        quality: number;
        moisture: number;
        quantity: number;
        weight: number;
        unitCode: string;
        price?: number;
    }[];
    constraints: {
        incoterms: (typeof incotermsKeys)[number];
        arbiterAddress: string;
        shipper: string;
        shippingPort: string;
        deliveryPort: string;
    };
};

export default (orderSpec: OrderSpec) => {
    const { getCompany } = useICPOrganization();

    const fixYPositions = (schemas: any[]): any => {
        return schemas.map((schema) => {
            const updatedSchema: any = {};
            for (const key in schema) {
                if (schema.hasOwnProperty(key)) {
                    const element = JSON.parse(JSON.stringify(schema[key]));
                    if (element.position && typeof element.position.y === 'number') {
                        element.position.y -= 3;
                    }
                    updatedSchema[key] = element;
                }
            }
            return updatedSchema;
        });
    };

    const generateJsonSpec = useCallback((): JSONOrderTemplate => {
        const supplier = getCompany(orderSpec.supplierAddress);
        const commissioner = getCompany(orderSpec.commissionerAddress);
        const arbiter = getCompany(orderSpec.constraints.arbiterAddress);

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
                    }
                },
                Shipper: orderSpec.constraints.shipper,
                ShippingPort: orderSpec.constraints.shippingPort,
                DeliveryPort: orderSpec.constraints.deliveryPort,
                Tax: {
                    TypeCode: 'VAT',
                    RateApplicablePercent: VAT_TAX
                },
                PriceFixing: {
                    Mode: "Seller's Call",
                    Currency: orderSpec.currency,
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

    const generatePdf = useCallback(async (jsonSpec: JSONOrderTemplate): Promise<Blob> => {
        const plugins = { text, image, qrcode: barcodes.qrcode };
        const inputs = [
            {
                sellerLegalName: 'Café Brasil Exportações Ltda',
                sellerContactName: 'João Silva Oliveira',
                sellerPhoneNumber: '+55 11 98765-4321',
                orderID: '12345',
                itemQuantity1: '500',
                itemUnit1: '60kg Bags',
                itemWeight: '30000',
                priceMode: "Seller's Call",
                currency: 'USDC',
                escrowPercentage: '20%',
                escrowTaxPercentage: '0,05%',
                arbiter: 'Arbiter 12345',
                shipper: 'MSC Cruise',
                shippingPort: 'Paranaguá Port',
                deliveryDate: '15/10/2024',
                deliveryPort: 'Genova',
                sampleYes: 'X',
                sampleNo: '',
                sellerAddress: 'Avenida das Palmeiras, 1234',
                sellerCity: '03506-000 - São Paulo',
                sellerEmail: 'joao.oliveira@cafebrasilexport.com.br',
                buyerLegalName: 'EuroCoffee Imports Ltd',
                buyerContactName: 'Marie Dupont\n',
                buyerPhoneNumber: '+32 2 123 4567',
                buyerAddress: 'Rue des Commerçants, 567',
                buyerCity: '1040 Bruxelles',
                buyerEmail: 'marie.dupont@eurocoffeeimports.eu',
                itemCategory: 'Arabica',
                itemTypology: 'Green beans / not roasted',
                itemQuality: '15',
                itemMoisture: '12%',
                priceValue: 'Average of daily closing prices from the previous month',
                insuranceResponsible: 'Buyer',
                insuranceDetails:
                    'The buyer assumes all risks and costs once the goods are on board the vessel.\n',
                issueDate: 'August 10, 2024',
                'priceValue copy':
                    'Payment due within 30 days of price fixing date\n.... could be free text more lines ...\n... ... ....',
                sellerRegion: 'Goiás GO, BRA',
                buyerRegion: 'Bruxelles-Capitale, Région de - BRU, BE',
                itemQuantity2: '3',
                itemUnit2: "40' Dry containers",
                incoterms: 'FOB',
                standards: 'RFA (Rain Forest Alliance),   ICO (Certificate of Origin)',
                sampleDescription: '1 lb shipping sample to be provided prior shipment',
                otherConditions:
                    '1) Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\n2) Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris\n...\n....\n.....\n6) Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident'
            }
        ];

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
        // window.open(URL.createObjectURL(blob));
    }, []);

    return {
        generateJsonSpec,
        generatePdf
    };
};
