import React from 'react';
import useOrderGenerator, { OrderSpec } from '@/hooks/documentGenerator/useOrderGenerator';
import {
    CompanyInfo,
    EmployeeInfo,
    useICPOrganization
} from '@/providers/entities/ICPOrganizationProvider';
import { renderHook } from '@testing-library/react';
import { incotermsMap } from '@/constants/trade';
import { ESCROW_FEE } from '@/constants/misc';
import { generate } from '@pdfme/generator';
import OrderTemplateSchema from '../../../templates/transaction/pdf-schemas/OrderTemplateSchema.json';
import { fixYPositions } from '@/hooks/documentGenerator/utils';
import { barcodes, image, text } from '@pdfme/schemas';

jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('@pdfme/generator');
jest.mock('@/constants/trade', () => ({
    incotermsMap: new Map([['FOB', { responsibleParty: 'Buyer', details: 'FOB Details' }]])
}));
jest.mock('@/hooks/documentGenerator/utils', () => ({
    fixYPositions: jest.fn()
}));

describe('userOrderGenerator', () => {
    const mockedGetCompany = jest.fn();
    const mockedGetEmployee = jest.fn();
    const mockedCompany = (address: string): CompanyInfo => ({
        id: address,
        legalName: `Company - ${address}`,
        address: '123 Street',
        postalCode: '12345',
        city: 'City',
        region: 'Region',
        countryCode: 'US',
        role: 'Supplier',
        telephone: '123-456-7890',
        email: 'supplier@email.com',
        image: 'image.jpg'
    });
    const mockedEmployee = (address: string): EmployeeInfo => ({
        name: `Name - ${address}`,
        lastname: `Surname - ${address}`,
        email: `employee@email.com`,
        telephone: '123-456-7890'
    });

    const orderSpec: OrderSpec = {
        id: 'order123',
        issueDate: Date.now(),
        supplierAddress: 'supplierAddress',
        commissionerAddress: 'commissionerAddress',
        currency: 'USDC',
        items: [
            {
                id: 'item1',
                productCategory: 'Category1',
                productTypology: 'Typology1',
                quality: 100,
                moisture: 5,
                quantitySpecs: [
                    { value: 1000, unitCode: 'KG' },
                    { value: 3, unitCode: 'Container' }
                ],
                weight: 1000,
                sample: { isNeeded: true, description: 'Sample description' },
                price: 500,
                standards: ['ISO']
            }
        ],
        constraints: {
            incoterms: 'FOB',
            guaranteePercentage: 10,
            arbiterAddress: 'arbiterAddress',
            shipper: 'Shipper',
            shippingPort: 'ShippingPort',
            deliveryPort: 'DeliveryPort',
            deliveryDate: new Date().setDate(new Date().getDate() + 10),
            otherConditions: 'No other conditions'
        }
    };

    beforeEach(() => {
        (useICPOrganization as jest.Mock).mockReturnValue({
            getCompany: mockedGetCompany,
            getEmployee: mockedGetEmployee
        });

        mockedGetCompany.mockImplementation((address) => mockedCompany(address));

        mockedGetEmployee.mockImplementation((address) => mockedEmployee(address));
    });

    it('should generate JSON spec correctly', () => {
        const { result } = renderHook(() => useOrderGenerator(orderSpec));
        const jsonSpec = result.current.generateJsonSpec();

        expect(mockedGetCompany).toHaveBeenCalledTimes(3);
        expect(mockedGetEmployee).toHaveBeenCalledTimes(3);

        expect(jsonSpec.Header.OrderID).toBe(orderSpec.id);
        expect(jsonSpec.Header.IssueDate).toBe(orderSpec.issueDate);
        // seller
        expect(jsonSpec.Header.Seller.ID).toBe(mockedCompany(orderSpec.supplierAddress).id);
        expect(jsonSpec.Header.Seller.Name).toBe(
            mockedCompany(orderSpec.supplierAddress).legalName
        );
        expect(jsonSpec.Header.Seller.Address).toEqual({
            StreetOne: mockedCompany(orderSpec.supplierAddress).address,
            PostalCode: mockedCompany(orderSpec.supplierAddress).postalCode,
            City: mockedCompany(orderSpec.supplierAddress).city,
            Region: mockedCompany(orderSpec.supplierAddress).region,
            CountryCode: mockedCompany(orderSpec.supplierAddress).countryCode
        });
        expect(jsonSpec.Header.Seller.Contact).toEqual({
            Name: mockedEmployee(orderSpec.supplierAddress).name,
            Surname: mockedEmployee(orderSpec.supplierAddress).lastname,
            Email: mockedEmployee(orderSpec.supplierAddress).email,
            Phone: mockedEmployee(orderSpec.supplierAddress).telephone
        });
        //buyer
        expect(jsonSpec.Header.Buyer.ID).toBe(mockedCompany(orderSpec.commissionerAddress).id);
        expect(jsonSpec.Header.Buyer.Name).toBe(
            mockedCompany(orderSpec.commissionerAddress).legalName
        );
        expect(jsonSpec.Header.Buyer.Address).toEqual({
            StreetOne: mockedCompany(orderSpec.commissionerAddress).address,
            PostalCode: mockedCompany(orderSpec.commissionerAddress).postalCode,
            City: mockedCompany(orderSpec.commissionerAddress).city,
            Region: mockedCompany(orderSpec.commissionerAddress).region,
            CountryCode: mockedCompany(orderSpec.commissionerAddress).countryCode
        });
        expect(jsonSpec.Header.Buyer.Contact).toEqual({
            Name: mockedEmployee(orderSpec.commissionerAddress).name,
            Surname: mockedEmployee(orderSpec.commissionerAddress).lastname,
            Email: mockedEmployee(orderSpec.commissionerAddress).email,
            Phone: mockedEmployee(orderSpec.commissionerAddress).telephone
        });
        // line items
        expect(jsonSpec.LineItems.length).toBe(orderSpec.items.length);
        expect(jsonSpec.LineItems[0].ItemId).toBe(orderSpec.items[0].id);
        expect(jsonSpec.LineItems[0].Description).toEqual({
            Category: orderSpec.items[0].productCategory,
            Typology: orderSpec.items[0].productTypology,
            Quality: orderSpec.items[0].quality,
            MoisturePercent: orderSpec.items[0].moisture
        });
        expect(jsonSpec.LineItems[0].QuantitySpecs.length).toBe(
            orderSpec.items[0].quantitySpecs.length
        );
        expect(jsonSpec.LineItems[0].QuantitySpecs[0]).toEqual({
            Value: orderSpec.items[0].quantitySpecs[0].value,
            UnitCode: orderSpec.items[0].quantitySpecs[0].unitCode
        });
        expect(jsonSpec.LineItems[0].Weight).toBe(orderSpec.items[0].weight);
        expect(jsonSpec.LineItems[0].Sample).toEqual({
            IsNeeded: orderSpec.items[0].sample.isNeeded,
            Description: orderSpec.items[0].sample.description
        });
        expect(jsonSpec.LineItems[0].UnitPrice).toBe(orderSpec.items[0].price);
        expect(jsonSpec.LineItems[0].Standards).toEqual([]);
        // terms
        expect(jsonSpec.Terms.Incoterms).toBe(orderSpec.constraints.incoterms);
        expect(jsonSpec.Terms.Insurance).toEqual({
            ResponsibleParty: incotermsMap.get(orderSpec.constraints.incoterms)?.responsibleParty,
            Details: incotermsMap.get(orderSpec.constraints.incoterms)?.details
        });
        expect(jsonSpec.Terms.Shipper).toBe(orderSpec.constraints.shipper);
        expect(jsonSpec.Terms.ShippingPort).toBe(orderSpec.constraints.shippingPort);
        expect(jsonSpec.Terms.DeliveryPort).toBe(orderSpec.constraints.deliveryPort);
        expect(jsonSpec.Terms.DeliveryDate).toBe(orderSpec.constraints.deliveryDate);
        expect(jsonSpec.Terms.Guarantee).toEqual({
            AmountPercent: orderSpec.constraints.guaranteePercentage,
            EscrowTaxPercent: ESCROW_FEE
        });
        expect(jsonSpec.Terms.PriceFixing).toEqual({
            Mode: "Seller's Call",
            Value: 'Average of daily closing prices from the previous month',
            Currency: orderSpec.currency,
            PriceSources: ['New York Mercantile Exchange (NYMEX)', 'London Metal Exchange (LME)'],
            SettlementConditions: 'Payment due within 30 days of price fixing date'
        });
        // terms - arbiter
        expect(jsonSpec.Terms.Arbiter.ID).toBe(
            mockedCompany(orderSpec.constraints.arbiterAddress).id
        );
        expect(jsonSpec.Terms.Arbiter.Name).toBe(
            mockedCompany(orderSpec.constraints.arbiterAddress).legalName
        );
        expect(jsonSpec.Terms.Arbiter.Address).toEqual({
            StreetOne: mockedCompany(orderSpec.constraints.arbiterAddress).address,
            PostalCode: mockedCompany(orderSpec.constraints.arbiterAddress).postalCode,
            City: mockedCompany(orderSpec.constraints.arbiterAddress).city,
            Region: mockedCompany(orderSpec.constraints.arbiterAddress).region,
            CountryCode: mockedCompany(orderSpec.constraints.arbiterAddress).countryCode
        });
        expect(jsonSpec.Terms.Arbiter.Contact).toEqual({
            Name: mockedEmployee(orderSpec.constraints.arbiterAddress).name,
            Surname: mockedEmployee(orderSpec.constraints.arbiterAddress).lastname,
            Email: mockedEmployee(orderSpec.constraints.arbiterAddress).email,
            Phone: mockedEmployee(orderSpec.constraints.arbiterAddress).telephone
        });
        // signatures
        expect(jsonSpec.Signatures.BuyerSignature).toEqual({
            Name: mockedEmployee(orderSpec.commissionerAddress).name,
            Surname: mockedEmployee(orderSpec.commissionerAddress).lastname
        });
        expect(jsonSpec.Signatures.SellerSignature).toEqual({
            Name: mockedEmployee(orderSpec.supplierAddress).name,
            Surname: mockedEmployee(orderSpec.supplierAddress).lastname
        });
        expect(jsonSpec.AdditionalInformation).toEqual({
            OtherConditions: orderSpec.constraints.otherConditions
        });
    });

    it('should generate PDF correctly', async () => {
        (generate as jest.Mock).mockResolvedValue({ buffer: new ArrayBuffer(8) });

        const { result } = renderHook(() => useOrderGenerator(orderSpec));
        const pdfBlob = await result.current.generatePdf();

        const jsonSpec = result.current.generateJsonSpec();
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
                escrowPercentage: `${jsonSpec.Terms.Guarantee.EscrowTaxPercent}%`,
                escrowTaxPercentage: `${jsonSpec.Terms.Guarantee.AmountPercent}%`,
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
        expect(generate).toHaveBeenCalledTimes(1);
        expect(generate).toHaveBeenNthCalledWith(1, {
            template: {
                ...OrderTemplateSchema,
                schemas: fixYPositions(OrderTemplateSchema.schemas)
            },
            inputs,
            plugins: { text, image, qrcode: barcodes.qrcode }
        });

        expect(pdfBlob).toBeInstanceOf(Blob);
        expect(pdfBlob.type).toBe('application/pdf');
    });
});
