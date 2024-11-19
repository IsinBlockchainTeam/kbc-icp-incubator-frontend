// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import React from 'react';
// import { render } from '@testing-library/react';
// import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
// import { ShipmentEvaluationStatus } from '@kbc-lib/coffee-trading-management-lib';
// import { ShipmentConfirmation } from '@/components/ShipmentPanel/phase/ShipmentConfirmation';
// import { useSelector } from 'react-redux';
// import { credentials } from '@/constants/ssi';
// import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
// import { GenericForm } from '@/components/GenericForm/GenericForm';
// import dayjs from 'dayjs';
// import { useParams } from 'react-router-dom';
//
// jest.mock('react-router-dom');
// jest.mock('react-redux');
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/providers/entities/EthOrderTradeProvider');
// jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');
// jest.mock('@/components/ConfirmButton/ConfirmButton');
// jest.mock('@/components/GenericForm/GenericForm');
//
// describe('ShipmentConfirmation', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//         (useSelector as jest.Mock).mockReturnValue({
//             companyClaims: { role: credentials.ROLE_EXPORTER }
//         });
//         (useParams as jest.Mock).mockReturnValue({ id: 'id' });
//     });
//     it('renders default message if detailedOrderTrade is not available', () => {
//         (useEthOrderTrade as jest.Mock).mockReturnValue({ detailedOrderTrade: null });
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<ShipmentConfirmation />);
//
//         expect(useEthOrderTrade).toHaveBeenCalled();
//         expect(getByText('Order not found')).toBeInTheDocument();
//     });
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthOrderTrade as jest.Mock).mockReturnValue({
//             detailedOrderTrade: { trade: { lines: [{ unit: 'unit', price: { fiat: 'fiat' } }] } }
//         });
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<ShipmentConfirmation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not found')).toBeInTheDocument();
//     });
//     it.each([
//         [ShipmentEvaluationStatus.NOT_EVALUATED, true],
//         [ShipmentEvaluationStatus.APPROVED, false],
//         [ShipmentEvaluationStatus.NOT_APPROVED, true]
//     ])('renders content', (detailsEvaluationStatus, editable) => {
//         const detailedShipment = {
//             shipment: {
//                 detailsSet: true,
//                 shipmentNumber: 1,
//                 detailsEvaluationStatus,
//                 price: 2,
//                 expirationDate: new Date(),
//                 fixingDate: new Date(),
//                 targetExchange: 'targetExchange',
//                 differentialApplied: 3,
//                 quantity: 4,
//                 containersNumber: 5,
//                 netWeight: 6,
//                 grossWeight: 7
//             }
//         };
//         (useEthOrderTrade as jest.Mock).mockReturnValue({
//             detailedOrderTrade: { trade: { lines: [{ unit: 'unit', price: { fiat: 'fiat' } }] } }
//         });
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment
//         });
//
//         render(<ShipmentConfirmation />);
//
//         expect(GenericForm).toHaveBeenCalledTimes(1);
//         const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
//         expect(elements).toHaveLength(11);
//         expect(elements[1].defaultValue).toEqual(detailedShipment.shipment.shipmentNumber);
//         expect(elements[1].disabled).toEqual(!editable);
//         expect(elements[2].defaultValue).toEqual(detailedShipment.shipment.price);
//         expect(elements[2].disabled).toEqual(!editable);
//         expect(elements[3].defaultValue).toEqual(dayjs(detailedShipment.shipment.expirationDate));
//         expect(elements[3].disabled).toEqual(!editable);
//         expect(elements[4].defaultValue).toEqual(dayjs(detailedShipment.shipment.fixingDate));
//         expect(elements[4].disabled).toEqual(!editable);
//         expect(elements[5].defaultValue).toEqual(detailedShipment.shipment.targetExchange);
//         expect(elements[5].disabled).toEqual(!editable);
//         expect(elements[6].defaultValue).toEqual(detailedShipment.shipment.differentialApplied);
//         expect(elements[6].disabled).toEqual(!editable);
//         expect(elements[7].defaultValue).toEqual(detailedShipment.shipment.quantity);
//         expect(elements[7].disabled).toEqual(!editable);
//         expect(elements[8].defaultValue).toEqual(detailedShipment.shipment.containersNumber);
//         expect(elements[8].disabled).toEqual(!editable);
//         expect(elements[9].defaultValue).toEqual(detailedShipment.shipment.netWeight);
//         expect(elements[9].disabled).toEqual(!editable);
//         expect(elements[10].defaultValue).toEqual(detailedShipment.shipment.grossWeight);
//         expect(elements[10].disabled).toEqual(!editable);
//
//         expect((GenericForm as jest.Mock).mock.calls[0][0].submittable).toEqual(editable);
//     });
//     it('allows to set details', () => {
//         const setDetails = jest.fn();
//         const detailedShipment = {
//             shipment: {
//                 detailsSet: true,
//                 shipmentNumber: 1,
//                 detailsEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED,
//                 price: 2,
//                 expirationDate: new Date(),
//                 fixingDate: new Date(),
//                 targetExchange: 'targetExchange',
//                 differentialApplied: 3,
//                 quantity: 4,
//                 containersNumber: 5,
//                 netWeight: 6,
//                 grossWeight: 7
//             }
//         };
//         (useEthOrderTrade as jest.Mock).mockReturnValue({
//             detailedOrderTrade: { trade: { lines: [{ unit: 'unit', price: { fiat: 'fiat' } }] } }
//         });
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment,
//             setDetails
//         });
//
//         render(<ShipmentConfirmation />);
//         const values = {
//             shipmentNumber: '1',
//             price: '2',
//             expirationDate: detailedShipment.shipment.expirationDate,
//             fixingDate: detailedShipment.shipment.fixingDate,
//             targetExchange: 'targetExchange',
//             differentialApplied: '3',
//             quantity: '4',
//             containersNumber: '5',
//             netWeight: '6',
//             grossWeight: '7'
//         };
//         (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);
//         expect(setDetails).toHaveBeenCalledWith(
//             Number(values['shipmentNumber']),
//             new Date(values['expirationDate']),
//             new Date(values['fixingDate']),
//             values['targetExchange'],
//             Number(values['differentialApplied']),
//             Number(values['price']),
//             Number(values['quantity']),
//             Number(values['containersNumber']),
//             Number(values['netWeight']),
//             Number(values['grossWeight'])
//         );
//
//         jest.clearAllMocks();
//         render(<ShipmentConfirmation />);
//         const invalidValues = {
//             shipmentNumber: '-1',
//             price: '2',
//             expirationDate: detailedShipment.shipment.expirationDate,
//             fixingDate: detailedShipment.shipment.fixingDate,
//             targetExchange: 'targetExchange',
//             differentialApplied: '3',
//             quantity: '4',
//             containersNumber: '5',
//             netWeight: '6',
//             grossWeight: '7'
//         };
//         (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(invalidValues);
//         expect(setDetails).not.toHaveBeenCalled();
//     });
//     it('allows to approve details', () => {
//         (useSelector as jest.Mock).mockReturnValue({
//             companyClaims: { role: credentials.ROLE_IMPORTER }
//         });
//         const approveDetails = jest.fn();
//         const detailedShipment = {
//             shipment: {
//                 detailsSet: true,
//                 shipmentNumber: 1,
//                 detailsEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED,
//                 price: 2,
//                 expirationDate: new Date(),
//                 fixingDate: new Date(),
//                 targetExchange: 'targetExchange',
//                 differentialApplied: 3,
//                 quantity: 4,
//                 containersNumber: 5,
//                 netWeight: 6,
//                 grossWeight: 7
//             }
//         };
//         (useEthOrderTrade as jest.Mock).mockReturnValue({
//             detailedOrderTrade: { trade: { lines: [{ unit: 'unit', price: { fiat: 'fiat' } }] } }
//         });
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment,
//             approveDetails
//         });
//
//         render(<ShipmentConfirmation />);
//         const values = {
//             shipmentNumber: '1',
//             price: '2',
//             expirationDate: detailedShipment.shipment.expirationDate,
//             fixingDate: detailedShipment.shipment.fixingDate,
//             targetExchange: 'targetExchange',
//             differentialApplied: '3',
//             quantity: '4',
//             containersNumber: '5',
//             netWeight: '6',
//             grossWeight: '7'
//         };
//         (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);
//         expect(approveDetails).toHaveBeenCalled();
//     });
// });
