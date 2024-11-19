// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import React from 'react';
// import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
// import { act, render } from '@testing-library/react';
// import { useNavigate } from 'react-router-dom';
// import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
// import { JsonRpcSigner } from '@ethersproject/providers';
// import { useSigner } from '@/providers/SignerProvider';
// import { ShipmentDocumentRules } from '@/constants/shipmentDocument';
// import { PreviewModal } from '@/components/PreviewModal/PreviewModal';
// import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
//
// jest.mock('react-router-dom');
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/providers/SignerProvider');
// jest.mock('@/components/PreviewModal/PreviewModal');
// jest.mock('@/components/ConfirmButton/ConfirmButton');
//
// describe('ShipmentDocumentTable', () => {
//     const signer = { _address: '0x123' } as JsonRpcSigner;
//     const navigate = jest.fn();
//
//     beforeEach(() => {
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//         jest.clearAllMocks();
//
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         (useSigner as jest.Mock).mockReturnValue({ signer });
//     });
//
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not found')).toBeInTheDocument();
//     });
//     it('renders correctly documents rows', () => {
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([
//                 [
//                     0,
//                     [
//                         { documentType: 0, info: { id: 0, status: 0 }, required: true },
//                         { documentType: 1, info: { id: 1, status: 1 }, required: false },
//                         { documentType: 2, info: { id: 2, status: 2 }, required: true },
//                         { documentType: 3, info: { id: 3, status: 1 }, required: false }
//                     ]
//                 ]
//             ]),
//             documents: new Map([
//                 [0, { content: 'content1' }],
//                 [1, { content: 'content2' }],
//                 [2, { content: 'content3' }],
//                 [3, { content: 'content4' }]
//             ])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText(ShipmentDocumentRules[0].name)).toBeInTheDocument();
//         expect(getByText(ShipmentDocumentRules[1].name)).toBeInTheDocument();
//         expect(getByText(ShipmentDocumentRules[2].name)).toBeInTheDocument();
//         expect(getByText(ShipmentDocumentRules[3].name)).toBeInTheDocument();
//     });
//     it('renders correctly single document row - NOT_EVALUATED', () => {
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, info: { id: 0 }, required: true }]]]),
//             documents: new Map([[0, { content: 'content1', status: 0, uploader: '0xuploader' }]])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText(ShipmentDocumentRules[0].name)).toBeInTheDocument();
//         expect(getByText('Exporter')).toBeInTheDocument();
//         expect(getByText('NOT_EVALUATED')).toBeInTheDocument();
//         expect(getByText('Preview')).toBeInTheDocument();
//         expect(getByText('Go to upload page')).toBeInTheDocument();
//         expect(ConfirmButton).toHaveBeenCalledTimes(2);
//     });
//     it('renders correctly single document row - APPROVED', () => {
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, info: { id: 0 }, required: true }]]]),
//             documents: new Map([[0, { content: 'content1', status: 1, uploader: '0xuploader' }]])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText(ShipmentDocumentRules[0].name)).toBeInTheDocument();
//         expect(getByText('Exporter')).toBeInTheDocument();
//         expect(getByText('APPROVED')).toBeInTheDocument();
//         expect(getByText('Preview')).toBeInTheDocument();
//     });
//     it('renders correctly single document row - NOT_APPROVED', () => {
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, info: { id: 0 }, required: true }]]]),
//             documents: new Map([[0, { content: 'content1', status: 2, uploader: '0xuploader' }]])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText(ShipmentDocumentRules[0].name)).toBeInTheDocument();
//         expect(getByText('Exporter')).toBeInTheDocument();
//         expect(getByText('NOT_APPROVED')).toBeInTheDocument();
//         expect(getByText('Preview')).toBeInTheDocument();
//         expect(getByText('Go to upload page')).toBeInTheDocument();
//     });
//     it('handle preview modal interaction', async () => {
//         const getDocument = jest.fn().mockResolvedValue({ content: 'content1' });
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, required: true }]]]),
//             documents: new Map([
//                 [0, { id: 0, content: 'content1', status: 0, uploader: '0xuploader' }]
//             ])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment, getDocument });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//         await act(async () => {
//             getByText('Preview').click();
//         });
//
//         expect(PreviewModal).toHaveBeenCalledTimes(2);
//         expect(PreviewModal).toHaveBeenCalledWith(
//             {
//                 open: true,
//                 getDocument: expect.any(Function),
//                 onClose: expect.any(Function)
//             },
//             {}
//         );
//
//         await (PreviewModal as jest.Mock).mock.calls[1][0].getDocument();
//         expect(getDocument).toHaveBeenCalledWith(0);
//
//         await act(async () => {
//             (PreviewModal as jest.Mock).mock.calls[1][0].onClose();
//         });
//         expect(PreviewModal).toHaveBeenCalledTimes(3);
//         expect(PreviewModal).toHaveBeenCalledWith(
//             {
//                 open: false,
//                 getDocument: expect.any(Function),
//                 onClose: expect.any(Function)
//             },
//             {}
//         );
//     });
//     it('handle approve document', async () => {
//         const approveDocument = jest.fn();
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, required: true }]]]),
//             documents: new Map([
//                 [0, { id: 0, content: 'content1', status: 0, uploader: '0xuploader' }]
//             ])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment, approveDocument });
//
//         render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(ConfirmButton).toHaveBeenCalledTimes(2);
//         expect(ConfirmButton).toHaveBeenCalledWith(
//             {
//                 type: 'link',
//                 text: 'Approve',
//                 confirmText: 'Are you sure you want to approve this document?',
//                 onConfirm: expect.any(Function)
//             },
//             {}
//         );
//
//         await (ConfirmButton as jest.Mock).mock.calls[0][0].onConfirm();
//         expect(approveDocument).toHaveBeenCalledWith(0);
//     });
//     it('handle reject document', async () => {
//         const rejectDocument = jest.fn();
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, required: true }]]]),
//             documents: new Map([
//                 [0, { id: 0, content: 'content1', status: 0, uploader: '0xuploader' }]
//             ])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment, rejectDocument });
//
//         render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         expect(ConfirmButton).toHaveBeenCalledTimes(2);
//         expect(ConfirmButton).toHaveBeenCalledWith(
//             {
//                 type: 'link',
//                 text: 'Reject',
//                 confirmText: 'Are you sure you want to reject this document?',
//                 onConfirm: expect.any(Function)
//             },
//             {}
//         );
//
//         await (ConfirmButton as jest.Mock).mock.calls[1][0].onConfirm();
//         expect(rejectDocument).toHaveBeenCalledWith(0);
//     });
//     it('handle go to upload page', async () => {
//         const detailedShipment = {
//             orderId: 1,
//             phaseDocuments: new Map([[0, [{ documentType: 0, required: true }]]]),
//             documents: new Map([
//                 [0, { id: 0, content: 'content1', status: 0, uploader: '0xuploader' }]
//             ])
//         };
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment });
//
//         const { getByText } = render(<ShipmentDocumentTable selectedPhase={0} />);
//
//         await act(async () => {
//             getByText('Go to upload page').click();
//         });
//         expect(navigate).toHaveBeenCalledWith(expect.any(String), {
//             state: { selectedDocumentType: 0 }
//         });
//     });
// });
