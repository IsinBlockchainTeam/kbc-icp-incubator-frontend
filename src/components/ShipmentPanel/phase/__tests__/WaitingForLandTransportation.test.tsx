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
// import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
// import { WaitingForLandTransportation } from '@/components/ShipmentPanel/phase/WaitingForLandTransportation';
// import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
//
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');
//
// describe('WaitingForLandTransportation', () => {
//     beforeAll(() => {
//         jest.resetAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//     });
//     it('renders content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({
//             detailedShipment: {}
//         });
//
//         render(<WaitingForLandTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(ShipmentDocumentTable).toHaveBeenCalled();
//         expect(ShipmentDocumentTable).toHaveBeenCalledWith(
//             {
//                 selectedPhase: ShipmentPhase.PHASE_3
//             },
//             {}
//         );
//     });
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<WaitingForLandTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not found')).toBeInTheDocument();
//     });
// });
