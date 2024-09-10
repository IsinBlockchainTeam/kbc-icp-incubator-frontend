import React from 'react';
import { render } from '@testing-library/react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { ShipmentPhase } from '@kbc-lib/coffee-trading-management-lib';
import { Result } from '@/components/ShipmentPanel/phase/Result';

jest.mock('@/providers/entities/EthShipmentProvider');
jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');

describe('Result', () => {
    beforeAll(() => {
        jest.resetAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    it('renders content', () => {
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: { phase: ShipmentPhase.ARBITRATION }
        });

        const { getByText } = render(<Result />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(getByText('ARBITRATION')).toBeInTheDocument();
    });
    it('renders default message if detailedShipment is not available', () => {
        (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });

        const { getByText } = render(<Result />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(getByText('Shipment not found')).toBeInTheDocument();
    });
});
