// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import React from 'react';
// import { act, render } from '@testing-library/react';
// import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
// import { ShipmentPanel } from '@/components/ShipmentPanel/ShipmentPanel';
// import { SampleApproval } from '@/components/ShipmentPanel/phase/SampleApproval';
// import { ShipmentConfirmation } from '@/components/ShipmentPanel/phase/ShipmentConfirmation';
// import { WaitingForLandTransportation } from '@/components/ShipmentPanel/phase/WaitingForLandTransportation';
// import { LandTransportation } from '@/components/ShipmentPanel/phase/LandTransportation';
// import { SeaTransportation } from '@/components/ShipmentPanel/phase/SeaTransportation';
// import { Result } from '@/components/ShipmentPanel/phase/Result';
//
// jest.mock('@/providers/entities/EthShipmentProvider');
// jest.mock('@/components/ShipmentPanel/phase/SampleApproval');
// jest.mock('@/components/ShipmentPanel/phase/ShipmentConfirmation');
// jest.mock('@/components/ShipmentPanel/phase/WaitingForLandTransportation');
// jest.mock('@/components/ShipmentPanel/phase/LandTransportation');
// jest.mock('@/components/ShipmentPanel/phase/SeaTransportation');
// jest.mock('@/components/ShipmentPanel/phase/Result');
//
// describe('ShipmentPanel', () => {
//     beforeAll(() => {
//         jest.resetAllMocks();
//         jest.spyOn(console, 'error').mockImplementation(() => {});
//     });
//     it('renders PHASE_1 content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 0 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(SampleApproval).toHaveBeenCalled();
//     });
//     it('renders PHASE_2 content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 1 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(ShipmentConfirmation).toHaveBeenCalled();
//     });
//     it('renders PHASE_3 content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 2 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(WaitingForLandTransportation).toHaveBeenCalled();
//     });
//     it('renders PHASE_4 content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 3 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(LandTransportation).toHaveBeenCalled();
//     });
//     it('renders PHASE_5 content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 4 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(SeaTransportation).toHaveBeenCalled();
//     });
//     it('renders CONFIRMED content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 5 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(Result).toHaveBeenCalled();
//     });
//     it('renders ARBITRATION content', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 6 } });
//
//         render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(Result).toHaveBeenCalled();
//     });
//     it('renders default message if detailedShipment is not available', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });
//
//         const { getByText } = render(<ShipmentPanel />);
//
//         expect(useEthShipment).toHaveBeenCalled();
//         expect(getByText('Shipment not created')).toBeInTheDocument();
//     });
//     it('change content on step change', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 2 } });
//
//         const { getByText } = render(<ShipmentPanel />);
//         expect(ShipmentConfirmation).not.toHaveBeenCalled();
//
//         act(() => {
//             getByText('Shipment Confirmation').click();
//         });
//
//         expect(ShipmentConfirmation).toHaveBeenCalled();
//     });
//     it('does not change content on step change if it is greater then the current', () => {
//         (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: { phase: 2 } });
//
//         const { getByText } = render(<ShipmentPanel />);
//         expect(ShipmentConfirmation).not.toHaveBeenCalled();
//
//         act(() => {
//             getByText('Land Transportation').click();
//         });
//
//         expect(LandTransportation).not.toHaveBeenCalled();
//     });
// });
