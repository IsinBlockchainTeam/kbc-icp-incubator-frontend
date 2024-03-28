import {TradePresentable} from "../../../../api/types/TradePresentable";
import {TradeStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {FormElement} from "../../../../components/GenericForm/GenericForm";
import {render, screen} from "@testing-library/react";
import TradeView from "../TradeView";
import {isValueInEnum} from "../../../../utils/utils";

jest.mock('../../../../components/structure/CardPage/CardPage', () => ({
    CardPage: ({title, children}: any) =>
        <div data-testid="card-page">
            <div data-testid="title">{title}</div>
            <div data-testid="body">{children}</div>
        </div>,
}));

jest.mock('../../../../components/GenericForm/GenericForm', () => ({
    GenericForm: ({elements, onSubmit}: any) => <div data-testid="generic-form">{elements}</div>,
}));

jest.mock('antd', () => ({
    ...jest.mock('antd'),
    Spin: ({children, ...props}: any) => <div {...props} data-testid="spin">{children}</div>,
    Tag: ({children, ...props}: any) => <div {...props} data-testid="tag">{children}</div>,
}));
jest.mock('@ant-design/icons', () => ({
    ...jest.requireActual('@ant-design/icons'),
    EditOutlined: ({children, ...props}: any) => <div {...props} data-testid="edit-outlined">{children}</div>,
}));

jest.mock('../../../../utils/utils', () => ({
    ...jest.requireActual('../../../../utils/utils'),
    checkAndGetEnvironmentVariable: jest.fn(),
    isValueInEnum: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

let mockType: TradeType = TradeType.BASIC;
let mockOrderState: number = 0;
let mockElements: FormElement[] = [];
let mockTrade: TradePresentable | undefined;
let loadingDocuments = false;
let disabled = false;
let mockToggleDisabled = jest.fn();
let mockOnSubmit = jest.fn();
jest.mock('../logic/tradeView', () => ({
    __esModule: true,
    default: () => ({
        type: mockType,
        orderState: mockOrderState,
        elements: mockElements,
        trade: mockTrade,
        loadingDocuments,
        disabled,
        toggleDisabled: mockToggleDisabled,
        onSubmit: mockOnSubmit,
    }),
}));

describe('TradeView', () => {
    beforeAll(() => jest.spyOn(console, 'error').mockImplementation(jest.fn()));

    beforeEach(() => {
        mockTrade = new TradePresentable(1, [], 'supplier', mockType).setStatus(TradeStatus.ON_BOARD);
        (isValueInEnum as jest.Mock).mockReturnValue(true);
    });

    afterEach(() => jest.clearAllMocks());

    it('should render correctly', () => {
        const tree = render(<TradeView/>);

        const card = tree.getByTestId('card-page');
        expect(card).toBeInTheDocument();

        const title = card.querySelector('[data-testid="title"]');
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('BASIC');
        expect(title!.querySelector('[data-testid="edit-outlined"]')).toBeInTheDocument();

        const body = card.querySelector('[data-testid="body"]');
        expect(body).toBeInTheDocument();
        expect(body!.querySelector('[data-testid="generic-form"]')).toBeInTheDocument();
    });

    it('should render loading', () => {
        mockTrade = undefined;
        const tree = render(<TradeView/>);

        expect(tree.getByTestId('spin')).toBeInTheDocument();
        expect(tree.queryByTestId('card-page')).not.toBeInTheDocument();
    });

    it('should handle wrong type', () => {
        (isValueInEnum as jest.Mock).mockReturnValue(false);
        const tree = render(<TradeView/>);

        expect(screen.getByText('Wrong type')).toBeInTheDocument();
        expect(tree.queryByTestId('card-page')).not.toBeInTheDocument();
    });

    it('should render status', () => {
        const tree = render(<TradeView/>);

        expect(tree.getByTestId('tag')).toBeInTheDocument();
        expect(tree.getByTestId('tag')).toHaveTextContent('ON_BOARD');
    });
});