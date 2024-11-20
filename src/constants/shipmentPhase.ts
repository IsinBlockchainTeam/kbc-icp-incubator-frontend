import { ShipmentPhase } from '@isinblockchainteam/kbc-icp-incubator-library';

export const ShipmentPhaseDisplayName: {
    [key in ShipmentPhase]: string;
} = {
    [ShipmentPhase.PHASE_1]: 'Sample Approval',
    [ShipmentPhase.PHASE_2]: 'Shipment Confirmation',
    [ShipmentPhase.PHASE_3]: 'Waiting for Land Transportation',
    [ShipmentPhase.PHASE_4]: 'Land Transportation',
    [ShipmentPhase.PHASE_5]: 'Sea transportation',
    [ShipmentPhase.CONFIRMED]: 'Confirmed',
    [ShipmentPhase.ARBITRATION]: 'Arbitration'
};
