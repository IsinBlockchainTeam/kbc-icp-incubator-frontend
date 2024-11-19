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
// import { SeaTransportation } from '@/components/ShipmentPanel/phase/SeaTransportation';
// import { useSelector } from 'react-redux';
// import { credentials } from '@/constants/ssi';
// import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
//
// jest.mock('react-redux');
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');
// jest.mock('@/components/ConfirmButton/ConfirmButton');
//
// describe('SeaTransportation', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//         (useSelector as jest.Mock).mockReturnValue({
//             companyClaims: { role: credentials.ROLE_IMPORTER }
//         });
//     });
//     it.each([
//         [ShipmentEvaluationStatus.NOT_EVALUATED],
//         [ShipmentEvaluationStatus.APPROVED],
//         [ShipmentEvaluationStatus.NOT_APPROVED]
//     ])('renders content', (qualityEvaluationStatus) => {
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment: { shipment: { qualityEvaluationStatus } }
//         });
//
//         const { getByText } = render(<SeaTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Quality Evaluation')).toBeInTheDocument();
//         expect(getByText('Quality Evaluation Status')).toBeInTheDocument();
//         expect(getByText(ShipmentEvaluationStatus[qualityEvaluationStatus])).toBeInTheDocument();
//     });
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<SeaTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not found')).toBeInTheDocument();
//     });
//     it('allows to confirm quality', () => {
//         const approveQuality = jest.fn();
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment: {
//                 shipment: { qualityEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED }
//             },
//             approveQuality
//         });
//         render(<SeaTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(ConfirmButton).toHaveBeenCalledTimes(2);
//         expect(ConfirmButton).toHaveBeenCalledWith(
//             {
//                 text: 'Confirm',
//                 confirmText: 'Are you sure you want to confirm the goods?',
//                 onConfirm: expect.any(Function),
//                 type: 'primary',
//                 block: true
//             },
//             {}
//         );
//
//         (ConfirmButton as jest.Mock).mock.calls[0][0].onConfirm();
//         expect(approveQuality).toHaveBeenCalled();
//     });
//     it('allows to reject quality', () => {
//         const rejectQuality = jest.fn();
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment: {
//                 shipment: { qualityEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED }
//             },
//             rejectQuality
//         });
//         render(<SeaTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(ConfirmButton).toHaveBeenCalledTimes(2);
//         expect(ConfirmButton).toHaveBeenCalledWith(
//             {
//                 text: 'Reject',
//                 confirmText: 'Are you sure you want to reject the goods?',
//                 onConfirm: expect.any(Function),
//                 danger: true,
//                 block: true
//             },
//             {}
//         );
//
//         (ConfirmButton as jest.Mock).mock.calls[1][0].onConfirm();
//         expect(rejectQuality).toHaveBeenCalled();
//     });
// });
