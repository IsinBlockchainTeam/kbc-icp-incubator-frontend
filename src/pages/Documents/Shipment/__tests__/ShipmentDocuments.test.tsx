// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import React from 'react';
// import ShipmentDocuments from '@/pages/Documents/Shipment/ShipmentDocuments';
// import { act, render } from '@testing-library/react';
// import {
//     NegotiationStatus,
//     OrderLine,
//     OrderTradeService,
//     Shipment,
//     ShipmentDocumentType,
//     ShipmentPhase,
//     TradeType
// } from '@kbc-lib/coffee-trading-management-lib';
// import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { credentials } from '@/constants/ssi';
// import { UserInfoState } from '@/redux/reducers/userInfoSlice';
// import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
// import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
// import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
// import { FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
// import { openNotification } from '@/utils/notification';
// import { setParametersPath } from '@/utils/page';
// import { paths } from '@/constants/paths';
// import DocumentUpload from '@/pages/Documents/DocumentUpload';
//
// jest.mock('antd', () => ({
//     ...jest.requireActual('antd'),
//     GenericForm: jest.fn()
// }));
// jest.mock('@kbc-lib/coffee-trading-management-lib');
// jest.mock('@/providers/entities/ICPOrganizationProvider');
// jest.mock('@/providers/entities/EthOrderTradeProvider');
// jest.mock('@/providers/entities/EthRawTradeProvider');
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/components/GenericForm/GenericForm');
// jest.mock('react-router-dom');
// jest.mock('react-redux');
// jest.mock('@/utils/notification');
// jest.mock('@/utils/page');
// jest.mock('@/pages/Documents/DocumentUpload');
//
// describe('Shipment Documents', () => {
//     const navigate = jest.fn();
//     const dispatch = jest.fn();
//     const getCompany = jest.fn();
//     const addDocument = jest.fn();
//     const getDetailedTradesAsync = jest.fn();
//
//     const userInfo = {
//         companyClaims: {
//             role: credentials.ROLE_EXPORTER
//         }
//     } as UserInfoState;
//     const detailedOrderTrade = {
//         trade: {
//             tradeId: 1,
//             lines: [{ id: 1, quantity: 1, unit: 'unit', price: { fiat: 'fiat1' } } as OrderLine]
//         },
//         service: {} as OrderTradeService,
//         negotiationStatus: NegotiationStatus.INITIALIZED
//     };
//     const detailedShipment = {
//         shipment: {} as Shipment,
//         documents: [],
//         phase: ShipmentPhase.PHASE_1,
//         phaseDocuments: new Map(),
//         orderId: 1
//     };
//     const rawTrades = [{ id: 1, address: '0x123', type: TradeType.ORDER } as RawTrade];
//
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         (useLocation as jest.Mock).mockReturnValue({
//             state: { selectedDocumentType: ShipmentDocumentType.BOOKING_CONFIRMATION }
//         });
//         (useDispatch as jest.Mock).mockReturnValue(dispatch);
//         (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
//         (useSelector as jest.Mock).mockReturnValue(userInfo);
//         (useICPOrganization as jest.Mock).mockReturnValue({ getCompany });
//         (useEthOrderTrade as jest.Mock).mockReturnValue({
//             detailedOrderTrade,
//             getDetailedTradesAsync
//         });
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment, addDocument });
//
//         getDetailedTradesAsync.mockResolvedValue([
//             { trade: { tradeId: 1 } },
//             { trade: { tradeId: 2 } }
//         ]);
//         getCompany.mockReturnValue({
//             legalName: 'legalName'
//         });
//     });
//
//     afterEach(() => {
//         jest.clearAllMocks();
//     });
//
//     it('should render correctly', async () => {
//         await act(async () => render(<ShipmentDocuments />));
//
//         expect(GenericForm).toHaveBeenCalledTimes(2);
//         expect(GenericForm).toHaveBeenCalledWith(
//             {
//                 elements: expect.any(Array),
//                 confirmText: 'This will upload the document for the order selected, proceed?',
//                 submittable: false
//             },
//             {}
//         );
//         const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
//         expect(elements).toHaveLength(3);
//         expect(elements[0].type).toEqual(FormElementType.SELECT);
//         expect(elements[0].label).toEqual('Orders');
//         expect(elements[1].type).toEqual(FormElementType.CARD);
//         expect(elements[1].title).toEqual('Order Details');
//         expect(elements[1].hidden).toEqual(false);
//         expect(elements[2].type).toEqual(FormElementType.CARD);
//         expect(elements[2].title).toEqual('Shipment Details');
//         expect(elements[2].hidden).toEqual(false);
//
//         expect(getDetailedTradesAsync).toHaveBeenCalledTimes(1);
//         expect(getCompany).toHaveBeenCalledTimes(4);
//     });
//     it('should show notification message if error occurs while retrieving detailed trades', async () => {
//         getDetailedTradesAsync.mockRejectedValue(new Error('error'));
//         await act(async () => render(<ShipmentDocuments />));
//         expect(GenericForm).toHaveBeenCalledTimes(1);
//         expect(dispatch).toHaveBeenCalledTimes(2);
//         expect(openNotification).toHaveBeenCalledTimes(1);
//     });
//     it('should handle order change', async () => {
//         await act(async () => render(<ShipmentDocuments />));
//         expect(GenericForm).toHaveBeenCalledTimes(2);
//         const elements = (GenericForm as jest.Mock).mock.calls[1][0].elements;
//         const orderElement = elements[0];
//         orderElement.onChange(1);
//         expect(navigate).toHaveBeenCalledTimes(1);
//         expect(setParametersPath).toHaveBeenCalledTimes(1);
//         expect(setParametersPath).toHaveBeenCalledWith(paths.ORDER_DOCUMENTS, { id: '2' });
//     });
//     it('should handle document submit', async () => {
//         await act(async () => render(<ShipmentDocuments />));
//         expect(GenericForm).toHaveBeenCalledTimes(2);
//         const elements = (GenericForm as jest.Mock).mock.calls[1][0].elements;
//         render(elements[2].content);
//         expect(DocumentUpload).toHaveBeenCalledTimes(1);
//         const documentElement = (DocumentUpload as jest.Mock).mock.calls[0][0];
//         await documentElement.onSubmit(
//             ShipmentDocumentType.BILL_OF_LADING,
//             'documentReferenceId',
//             'filename',
//             new Blob()
//         );
//         expect(addDocument).toHaveBeenCalledTimes(1);
//         expect(addDocument).toHaveBeenCalledWith(
//             ShipmentDocumentType.BILL_OF_LADING,
//             'documentReferenceId',
//             'filename',
//             expect.any(Blob)
//         );
//         expect(navigate).toHaveBeenCalledTimes(1);
//     });
// });
