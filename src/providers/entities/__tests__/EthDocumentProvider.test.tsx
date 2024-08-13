import { renderHook } from '@testing-library/react';
import {
    DOCUMENT_DUTY,
    DocumentDetail,
    DocumentRequest,
    EthDocumentProvider,
    useEthDocument
} from '../EthDocumentProvider';
import {
    DocumentInfo,
    DocumentService,
    DocumentStatus,
    DocumentType,
    ICPFileDriver,
    OrderStatus,
    OrderTradeService
} from '@kbc-lib/coffee-trading-management-lib';
import { useDispatch, useSelector } from 'react-redux';
import { useSigner } from '@/providers/SignerProvider';
import { useICP } from '@/providers/ICPProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { openNotification } from '@/utils/notification';
import { JsonRpcSigner } from '@ethersproject/providers';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/SignerProvider');
jest.mock('react-redux');
jest.mock('@/utils/notification');
jest.mock('@/providers/ICPProvider');

describe('EthDocumentProvider', () => {
    const userInfo = { companyClaims: { organizationId: '1' } } as UserInfoState;
    const signer = { _address: '0x123' } as JsonRpcSigner;
    const dispatch = jest.fn();
    const getCompleteDocument = jest.fn();
    const orderTradeService = {
        getDocumentsByType: jest.fn(),
        getDocumentStatus: jest.fn(),
        getCompleteDocument: jest.fn(),
        validateDocument: jest.fn(),
        addDocument: jest.fn()
    } as unknown as OrderTradeService;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICP as jest.Mock).mockReturnValue({
            fileDriver: {} as ICPFileDriver
        });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (DocumentService as jest.Mock).mockImplementation(() => ({
            getCompleteDocument
        }));
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEthDocument())).toThrow();
    });

    it('should retrieve document detail map', async () => {
        const documentInfo = { externalUrl: 'file' } as DocumentInfo;
        (orderTradeService.getDocumentsByType as jest.Mock).mockResolvedValue([
            documentInfo,
            { externalUrl: 'file.json' } as DocumentInfo
        ]);
        (orderTradeService.getDocumentStatus as jest.Mock).mockResolvedValue(
            DocumentStatus.APPROVED
        );
        getCompleteDocument.mockResolvedValue({} as Document);
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        const map = await result.current.getDocumentDetailMap(orderTradeService);

        expect(orderTradeService.getDocumentsByType).toHaveBeenCalled();
        expect(orderTradeService.getDocumentStatus).toHaveBeenCalled();
        expect(getCompleteDocument).toHaveBeenCalled();

        const documentDetail = {
            info: documentInfo,
            status: DocumentStatus.APPROVED,
            content: expect.any(Object)
        };
        expect(map.get(OrderStatus.PRODUCTION)?.get(DocumentType.PAYMENT_INVOICE)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.ORIGIN_SWISS_DECODE)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.WEIGHT_CERTIFICATE)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.FUMIGATION_CERTIFICATE)).toEqual(
            documentDetail
        );
        expect(
            map.get(OrderStatus.PAYED)?.get(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE)
        ).toEqual(documentDetail);
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.PHYTOSANITARY_CERTIFICATE)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.INSURANCE_CERTIFICATE)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.EXPORTED)?.get(DocumentType.BILL_OF_LADING)).toEqual(
            documentDetail
        );
        expect(map.get(OrderStatus.SHIPPED)?.get(DocumentType.COMPARISON_SWISS_DECODE)).toEqual(
            documentDetail
        );
    });

    it('should retrieve document detail map - document not found', async () => {
        (orderTradeService.getDocumentsByType as jest.Mock).mockResolvedValue([
            { externalUrl: 'file.json' } as DocumentInfo
        ]);
        getCompleteDocument.mockResolvedValue({} as Document);
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        const map = await result.current.getDocumentDetailMap(orderTradeService);

        expect(orderTradeService.getDocumentsByType).toHaveBeenCalled();
        expect(orderTradeService.getDocumentStatus).not.toHaveBeenCalled();

        expect(map.get(OrderStatus.PRODUCTION)?.get(DocumentType.PAYMENT_INVOICE)).toEqual(null);
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.ORIGIN_SWISS_DECODE)).toEqual(null);
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.WEIGHT_CERTIFICATE)).toEqual(null);
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.FUMIGATION_CERTIFICATE)).toEqual(null);
        expect(
            map.get(OrderStatus.PAYED)?.get(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE)
        ).toEqual(null);
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.PHYTOSANITARY_CERTIFICATE)).toEqual(
            null
        );
        expect(map.get(OrderStatus.PAYED)?.get(DocumentType.INSURANCE_CERTIFICATE)).toEqual(null);
        expect(map.get(OrderStatus.EXPORTED)?.get(DocumentType.BILL_OF_LADING)).toEqual(null);
        expect(map.get(OrderStatus.SHIPPED)?.get(DocumentType.COMPARISON_SWISS_DECODE)).toEqual(
            null
        );
    });

    it('should validate document - approve', async () => {
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        await result.current.validateDocument(1, DocumentStatus.APPROVED, orderTradeService);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(orderTradeService.validateDocument).toHaveBeenCalledWith(1, DocumentStatus.APPROVED);
        expect(openNotification).toHaveBeenCalled();
    });

    it('should validate document - reject', async () => {
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        await result.current.validateDocument(1, DocumentStatus.NOT_APPROVED, orderTradeService);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(orderTradeService.validateDocument).toHaveBeenCalledWith(
            1,
            DocumentStatus.NOT_APPROVED
        );
        expect(openNotification).toHaveBeenCalled();
    });

    it('should handle validate document failure', async () => {
        (orderTradeService.validateDocument as jest.Mock).mockRejectedValue(new Error('error'));
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        await result.current.validateDocument(1, DocumentStatus.APPROVED, orderTradeService);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(orderTradeService.validateDocument).toHaveBeenCalledWith(1, DocumentStatus.APPROVED);
        expect(openNotification).toHaveBeenCalled();
    });

    it('should upload document', async () => {
        const documentRequest = {
            documentType: DocumentType.BILL_OF_LADING,
            filename: 'filename',
            content: { type: 'pdf' }
        } as DocumentRequest;
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        await result.current.uploadDocument(documentRequest, 'externalUrl', orderTradeService);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(orderTradeService.addDocument).toHaveBeenCalledWith(
            DocumentType.BILL_OF_LADING,
            expect.anything(),
            'externalUrl',
            {
                name: documentRequest.filename,
                type: documentRequest.content.type
            },
            [0]
        );
        expect(openNotification).toHaveBeenCalled();
    });

    it('should handle upload document failure', async () => {
        const documentRequest = {
            documentType: DocumentType.BILL_OF_LADING,
            filename: 'filename',
            content: { type: 'pdf' }
        } as DocumentRequest;
        (orderTradeService.addDocument as jest.Mock).mockRejectedValue(new Error('error'));
        const { result } = renderHook(() => useEthDocument(), {
            wrapper: EthDocumentProvider
        });
        await result.current.uploadDocument(documentRequest, 'externalUrl', orderTradeService);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(openNotification).toHaveBeenCalled();
    });

    it.each([
        [signer._address, '0xother', null, DOCUMENT_DUTY.UPLOAD_NEEDED],
        [
            signer._address,
            '0xother',
            { status: DocumentStatus.NOT_APPROVED } as DocumentDetail,
            DOCUMENT_DUTY.UPLOAD_POSSIBLE
        ],
        [
            '0xother',
            signer._address,
            { status: DocumentStatus.NOT_EVALUATED } as DocumentDetail,
            DOCUMENT_DUTY.APPROVAL_NEEDED
        ],
        [
            '0xother',
            signer._address,
            { status: DocumentStatus.APPROVED } as DocumentDetail,
            DOCUMENT_DUTY.NO_ACTION_NEEDED
        ]
    ])(
        'should retrieve document duty',
        async (uploaderAddress, approverAddress, documentDetail, documentDuty) => {
            const { result } = renderHook(() => useEthDocument(), {
                wrapper: EthDocumentProvider
            });
            expect(
                result.current.getDocumentDuty(uploaderAddress, approverAddress, documentDetail)
            ).toEqual(documentDuty);
        }
    );
});
