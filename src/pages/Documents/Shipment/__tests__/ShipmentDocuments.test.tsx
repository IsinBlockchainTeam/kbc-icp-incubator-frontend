import React from 'react';
import ShipmentDocuments from '@/pages/Documents/Shipment/ShipmentDocuments';
import { render } from '@testing-library/react';
import {
    NegotiationStatus,
    OrderLine,
    OrderTradeService,
    Shipment,
    ShipmentDocumentType,
    ShipmentPhase,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { credentials } from '@/constants/ssi';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { RawTrade, useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { useICPName } from '@/providers/entities/ICPNameProvider';
import { useEthShipment } from '@/providers/entities/EthShipmentProvider';
import { FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    GenericForm: jest.fn()
}));
jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('@/providers/entities/EthShipmentProvider');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('react-router-dom');
jest.mock('react-redux');

describe('Shipment Documents', () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const getName = jest.fn();
    const addDocument = jest.fn();
    const getDetailedTradesAsync = jest.fn();

    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        }
    } as UserInfoState;
    const detailedOrderTrade = {
        trade: {
            tradeId: 1,
            lines: [{ id: 1, quantity: 1, unit: 'unit', price: { fiat: 'fiat1' } } as OrderLine]
        },
        service: {} as OrderTradeService,
        negotiationStatus: NegotiationStatus.INITIALIZED
    };
    const detailedShipment = {
        shipment: {
            landTransportationRequiredDocumentsTypes: [
                ShipmentDocumentType.BOOKING_CONFIRMATION,
                ShipmentDocumentType.INSURANCE_CERTIFICATE
            ],
            seaTransportationRequiredDocumentsTypes: [ShipmentDocumentType.BILL_OF_LADING]
        } as Shipment,
        documents: [],
        phase: ShipmentPhase.APPROVAL
    };
    const rawTrades = [{ id: 1, address: '0x123', type: TradeType.ORDER } as RawTrade];

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useEthRawTrade as jest.Mock).mockReturnValue({ rawTrades });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (useICPName as jest.Mock).mockReturnValue({ getName });
        (useEthOrderTrade as jest.Mock).mockReturnValue({
            detailedOrderTrade,
            getDetailedTradesAsync
        });
        (useEthShipment as jest.Mock).mockReturnValue({ detailedShipment, addDocument });

        getDetailedTradesAsync.mockResolvedValue([
            { trade: { tradeId: 1 } },
            { trade: { tradeId: 2 } }
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', async () => {
        render(<ShipmentDocuments />);

        expect(GenericForm).toHaveBeenCalledTimes(1);
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                confirmText: 'This will upload the document for the order selected, proceed?',
                submittable: false
            },
            {}
        );
        const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
        expect(elements).toHaveLength(3);
        expect(elements[0].type).toEqual(FormElementType.SELECT);
        expect(elements[0].label).toEqual('Orders');
        expect(elements[1].type).toEqual(FormElementType.CARD);
        expect(elements[1].title).toEqual('Order Details');
        expect(elements[1].hidden).toEqual(false);
        expect(elements[2].type).toEqual(FormElementType.CARD);
        expect(elements[2].title).toEqual('Shipment Details');
        expect(elements[2].hidden).toEqual(false);

        expect(getDetailedTradesAsync).toHaveBeenCalledTimes(1);
        expect(getName).toHaveBeenCalledTimes(1);
    });
});
