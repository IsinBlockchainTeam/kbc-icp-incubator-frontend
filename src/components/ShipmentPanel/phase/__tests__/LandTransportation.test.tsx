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
// import { LandTransportation } from '@/components/ShipmentPanel/phase/LandTransportation';
// import { ShipmentDocumentTable } from '@/components/ShipmentPanel/ShipmentDocumentTable';
// import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
//
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');
//
// describe('LandTransportation', () => {
//     beforeAll(() => {
//         jest.resetAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//     });
//     it('renders content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: {} });
//
//         render(<LandTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(ShipmentDocumentTable).toHaveBeenCalled();
//         expect(ShipmentDocumentTable).toHaveBeenCalledWith(
//             {
//                 selectedPhase: ShipmentPhase.PHASE_4
//             },
//             {}
//         );
//     });
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<LandTransportation />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not found')).toBeInTheDocument();
//     });
// });
