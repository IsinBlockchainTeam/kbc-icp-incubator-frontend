import React from 'react';
import { render } from '@testing-library/react';
import DocumentUpload from '@/pages/Documents/DocumentUpload';
import { ShipmentDocumentInfo, ShipmentDocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';

jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('antd');

describe('Document Upload', () => {
    const documentTypes = [
        ShipmentDocumentType.BOOKING_CONFIRMATION,
        ShipmentDocumentType.INSURANCE_CERTIFICATE
    ];
    const oldDocumentsInfo = [
        { id: 1, type: ShipmentDocumentType.BOOKING_CONFIRMATION } as ShipmentDocumentInfo
    ];
    const onSubmit = jest.fn();

    it('should render correctly', async () => {
        render(
            <DocumentUpload
                documentTypes={documentTypes}
                oldDocumentsInfo={oldDocumentsInfo}
                onSubmit={onSubmit}
            />
        );
        expect(GenericForm).toHaveBeenCalledTimes(1);
        const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
        expect(elements).toHaveLength(3);
        expect(elements[0].type).toEqual(FormElementType.INPUT);
        expect(elements[0].label).toEqual('Reference Id');
        expect(elements[1].type).toEqual(FormElementType.SELECT);
        expect(elements[1].label).toEqual('Document Type');
        expect(elements[2].type).toEqual(FormElementType.DOCUMENT);
        expect(elements[2].label).toEqual('Document');
    });

    it('should render correctly with state', async () => {
        render(
            <DocumentUpload
                documentTypes={documentTypes}
                oldDocumentsInfo={oldDocumentsInfo}
                onSubmit={onSubmit}
                selectedDocumentType={ShipmentDocumentType.BOOKING_CONFIRMATION}
            />
        );
        const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
        expect(elements[1].defaultValue).toEqual(ShipmentDocumentType.BOOKING_CONFIRMATION);
    });

    it('should submit correctly', async () => {
        render(
            <DocumentUpload
                documentTypes={documentTypes}
                oldDocumentsInfo={oldDocumentsInfo}
                onSubmit={onSubmit}
            />
        );
        const values = {
            documentType: ShipmentDocumentType.BOOKING_CONFIRMATION,
            referenceId: '123',
            document: { name: 'file.pdf' }
        };

        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
