import React from 'react';
import { render } from '@testing-library/react';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { ShipmentEvaluationStatus } from '@kbc-lib/coffee-trading-management-lib';
import { SampleApproval } from '@/components/ShipmentPanel/phase/SampleApproval';
import { useSelector } from 'react-redux';
import { credentials } from '@/constants/ssi';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';

jest.mock('react-redux');
jest.mock('@/providers/entities/EthShipmentProvider');
jest.mock('@/components/ShipmentPanel/ShipmentDocumentTable');
jest.mock('@/components/ConfirmButton/ConfirmButton');

describe('SampleApproval', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        (useSelector as jest.Mock).mockReturnValue({
            companyClaims: { role: credentials.ROLE_IMPORTER }
        });
    });
    it.each([
        [ShipmentEvaluationStatus.NOT_EVALUATED],
        [ShipmentEvaluationStatus.APPROVED],
        [ShipmentEvaluationStatus.NOT_APPROVED]
    ])('renders content', (sampleEvaluationStatus: ShipmentEvaluationStatus) => {
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: { shipment: { sampleEvaluationStatus } }
        });

        const { getByText } = render(<SampleApproval />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(getByText(ShipmentEvaluationStatus[sampleEvaluationStatus])).toBeInTheDocument();
    });
    it('renders default message if detailedShipment is not available', () => {
        (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment: null });

        const { getByText } = render(<SampleApproval />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(getByText('Shipment not found')).toBeInTheDocument();
    });
    it('confirms the sample', () => {
        const approveSample = jest.fn();
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: {
                shipment: { sampleEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED }
            },
            approveSample
        });
        render(<SampleApproval />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(ConfirmButton).toHaveBeenCalledTimes(2);
        expect(ConfirmButton).toHaveBeenCalledWith(
            {
                text: 'Confirm',
                confirmText: 'Are you sure you want to confirm the sample?',
                onConfirm: expect.any(Function),
                type: 'primary',
                block: true
            },
            {}
        );

        (ConfirmButton as jest.Mock).mock.calls[0][0].onConfirm();
        expect(approveSample).toHaveBeenCalled();
    });
    it('rejects the sample', () => {
        const rejectSample = jest.fn();
        (useEthShipment as jest.Mock).mockReturnValue({
            detailedShipment: {
                shipment: { sampleEvaluationStatus: ShipmentEvaluationStatus.NOT_EVALUATED }
            },
            rejectSample
        });
        render(<SampleApproval />);

        expect(useEthShipment).toHaveBeenCalled();
        expect(ConfirmButton).toHaveBeenCalledTimes(2);
        expect(ConfirmButton).toHaveBeenCalledWith(
            {
                text: 'Reject',
                confirmText: 'Are you sure you want to reject the sample?',
                onConfirm: expect.any(Function),
                danger: true,
                block: true
            },
            {}
        );

        (ConfirmButton as jest.Mock).mock.calls[1][0].onConfirm();
        expect(rejectSample).toHaveBeenCalled();
    });
});
