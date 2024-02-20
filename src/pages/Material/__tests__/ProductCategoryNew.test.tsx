import {useNavigate} from "react-router-dom";
import ProductCategoryNew from "../ProductCategoryNew";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MaterialService} from "../../../api/services/MaterialService";
import {paths} from "../../../constants";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../api/services/MaterialService');
jest.mock('../../../api/strategies/material/BlockchainMaterialStrategy');

describe('Product Category New', () => {
    const navigate = jest.fn();
    const mockedSaveProductCategory = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (MaterialService as jest.Mock).mockImplementation(() => ({
            saveProductCategory: mockedSaveProductCategory
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<ProductCategoryNew/>);

        expect(screen.getByText('New Product Category')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'delete Delete Product Category'})).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Quality')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<ProductCategoryNew/>);

        userEvent.type(screen.getByRole('textbox', {name: 'Name'}), 'Raw coffee beans');
        userEvent.type(screen.getByRole('textbox', {name: 'Quality'}), '100');
        userEvent.type(screen.getByRole('textbox', {name: 'Description'}), 'Raw coffee beans from Brazil');
        userEvent.click(screen.getByRole('button', {name: 'Submit'}));

        await waitFor(() => {
            expect(mockedSaveProductCategory).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
        })
    });

    it('should navigate to \'Materials\' when clicking on \'Delete Product Category\' button', async () => {
        render(<ProductCategoryNew/>);

        userEvent.click(screen.getByRole('button', {name: 'delete Delete Product Category'}));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
        });
    });
});