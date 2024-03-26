import PDFUploader from "../PDFUploader";
import {fireEvent, render} from "@testing-library/react";

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Button: ({children, ...props}: any) => <div {...props} data-testid="button">{children}</div>,
        Upload: {
            Dragger: ({children, ...props}: any) => <div {...props} data-testid="dragger">{children}</div>
        }
    };
});

jest.mock('@ant-design/icons', () => {
    return {
        ...jest.requireActual('@ant-design/icons'),
        InboxOutlined: ({children, ...props}: any) => <div {...props} data-testid="inbox-outlined">{children}</div>,
        RollbackOutlined: ({children, ...props}: any) => <div {...props}
                                                              data-testid="rollback-outlined">{children}</div>
    };
});

jest.mock('../../../utils/notification', () => {
    return {
        ...jest.requireActual('../../../utils/notification'),
        openNotification: jest.fn()
    }
});

describe('PDFUploader', () => {
    const mockOnFileUpload = jest.fn();
    const mockOnRevert = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    afterEach(() => jest.clearAllMocks());
    it('should render correctly', () => {
        const tree = render(<PDFUploader onFileUpload={jest.fn()} onRevert={jest.fn()}/>);
        expect(tree.getByTestId('dragger')).toBeInTheDocument();
        expect(tree.getByTestId('inbox-outlined')).toBeInTheDocument();
        expect(tree.getByTestId('button')).toBeInTheDocument();
    });
    // it('should call onFileUpload when file is uploaded', async () => {
    //     const file = new File(['file contents'], 'file.pdf', { type: 'application/pdf' });
    //     const tree = render(<PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert}/>);
    //     fireEvent.change(tree.getByTestId('dragger'), {target: {files: [file]}});
    //     await waitFor(() => expect(mockOnFileUpload).toHaveBeenCalled());
    //     expect(openNotification).toHaveBeenCalledTimes(1);
    // });
    it('should call onRevert when button is clicked', () => {
        const tree = render(<PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert}/>);
        fireEvent.click(tree.getByTestId('button'));
        expect(mockOnRevert).toHaveBeenCalledTimes(1);
    });
});