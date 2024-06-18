import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
import { TradeNew } from '../TradeNew';
import { fireEvent, render } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { FormElement } from '@/components/GenericForm/GenericForm';

import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../../utils/utils', () => ({
    ...jest.requireActual('../../../../utils/utils'),
    checkAndGetEnvironmentVariable: jest.fn()
}));

let mockType: TradeType = TradeType.BASIC;
let mockOrderState: number = 0;
let mockElements: FormElement[] = [];
let mockOnSubmit = jest.fn();
jest.mock('../logic/tradeNew', () => ({
    __esModule: true,
    default: () => ({
        type: mockType,
        orderState: mockOrderState,
        elements: mockElements,
        menuProps: {
            items: [
                { label: 'BASIC', key: '0' },
                { label: 'ORDER', key: '1' }
            ],
            onClick: jest.fn()
        },
        onSubmit: mockOnSubmit
    })
}));

jest.mock('antd', () => ({
    Button: ({ children, ...props }: any) => (
        <div {...props} data-testid="button" role="button">
            {children}
        </div>
    ),
    Divider: ({ children, ...props }: any) => (
        <div {...props} data-testid="divider">
            {children}
        </div>
    ),
    Dropdown: ({ children, ...props }: any) => (
        <div {...props} data-testid="dropdown">
            {children}
        </div>
    ),
    Steps: ({ children, ...props }: any) => (
        <div {...props} data-testid="steps">
            {children}
        </div>
    ),
    Typography: {
        Text: ({ children, ...props }: any) => (
            <div {...props} data-testid="text">
                {children}
            </div>
        )
    }
}));
jest.mock('@ant-design/icons', () => ({
    ...jest.requireActual('@ant-design/icons'),
    DeleteOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="delete-outlined">
            {children}
        </div>
    ),
    DownOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="down-outlined">
            {children}
        </div>
    ),
    EditOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="edit-outlined">
            {children}
        </div>
    ),
    ImportOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="import-outlined">
            {children}
        </div>
    ),
    ProductOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="product-outlined">
            {children}
        </div>
    ),
    SendOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="send-outlined">
            {children}
        </div>
    ),
    TruckOutlined: ({ children, ...props }: any) => (
        <div {...props} data-testid="truck-outlined">
            {children}
        </div>
    )
}));

jest.mock('../../../../components/GenericForm/GenericForm', () => ({
    GenericForm: ({ elements, onSubmit }: any) => <div data-testid="generic-form">{elements}</div>
}));

jest.mock('../../../../components/structure/CardPage/CardPage', () => ({
    CardPage: ({ title, children }: any) => (
        <div data-testid="card-page">
            <div data-testid="title">{title}</div>
            <div data-testid="body">{children}</div>
        </div>
    )
}));

describe('TradeNew', () => {
    const mockNavigate = jest.fn();

    beforeAll(() => jest.spyOn(console, 'error').mockImplementation(jest.fn()));

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    afterEach(() => jest.clearAllMocks());

    it('should render correctly', () => {
        const tree = render(<TradeNew />);

        const card = tree.getByTestId('card-page');
        expect(card).toBeInTheDocument();

        const title = card.querySelector('[data-testid="title"]');
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('New Trade');
        const button = title!.querySelector('[data-testid="button"]');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Delete Trade');

        const body = card.querySelector('[data-testid="body"]');
        expect(body).toBeInTheDocument();
        expect(body).toHaveTextContent('Trade Type:');
        const dropdown = body!.querySelector('[data-testid="dropdown"]');
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveTextContent('BASIC');
        expect(body!.querySelector('[data-testid="generic-form"]')).toBeInTheDocument();
    });

    it('should navigate to trades page when delete button is clicked', () => {
        const tree = render(<TradeNew />);
        const button = tree.getByRole('button', { name: 'Delete Trade' });
        fireEvent.click(button);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(paths.TRADES);
    });

    it('should render status steps when type is ORDER', () => {
        mockType = TradeType.ORDER;
        mockOrderState = 3;
        const tree = render(<TradeNew />);
        const steps = tree.getByTestId('steps');
        expect(steps).toBeInTheDocument();
        expect(steps).toHaveAttribute('current', mockOrderState.toString());
    });
});
