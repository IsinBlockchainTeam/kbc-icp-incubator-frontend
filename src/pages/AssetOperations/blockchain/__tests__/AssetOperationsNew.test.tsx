import {useNavigate} from "react-router-dom";
import {TransformationService} from "../../../../api/services/TransformationService";
import {render, screen, waitFor} from "@testing-library/react";
import AssetOperationsNew from "../AssetOperationsNew";
import userEvent from "@testing-library/user-event";
import {paths} from "../../../../constants";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../../api/services/TransformationService');
jest.mock('../../../../api/strategies/asset_operation/BlockchainAssetOperationStrategy');

describe('Asset Operations New', () => {
    const navigate = jest.fn();
    const mockedSaveTransformation = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (TransformationService as jest.Mock).mockImplementation(() => ({
            saveTransformation: mockedSaveTransformation
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<AssetOperationsNew />);

        expect(screen.getByText('New Asset Operation')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'delete Delete Asset Operation'})).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Input Material Id')).toBeInTheDocument();
        expect(screen.getByText('Output Material Id')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<AssetOperationsNew />);

        userEvent.type(screen.getByRole('textbox', {name: 'Name'}), 'Test');
        userEvent.type(screen.getByRole('textbox', {name: 'Input Material Id'}), '1');
        userEvent.type(screen.getByRole('textbox', {name: 'Output Material Id'}), '2');
        userEvent.click(screen.getByRole('button', {name: 'Submit'}));

        await waitFor(() => {
            expect(mockedSaveTransformation).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
        });
    });

    it('should navigate to \'Asset Operations\' when clicking on \'Delete Asset Operation\' button', async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByRole('button', {name: 'delete Delete Asset Operation'}));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
        });
    });

    it('should add input material when clicking on \'Add Input Material\' button', async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByText('New input material'));

        await waitFor(() => {
            const inputMaterials = screen.getAllByText('Input Material Id');
            expect(inputMaterials).toHaveLength(2);
            expect(inputMaterials[1]).toHaveAttribute('for', 'generic-form_input-material-id-2');
        });
    });

    it('should call deleteInputMaterial function when clicking on delete button', async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByText('New input material'));

        await waitFor(() => {
            userEvent.click(screen.getByText('Delete input material'));
            expect(console.log).toHaveBeenCalledWith('deleting', 2);
        });
    });
});