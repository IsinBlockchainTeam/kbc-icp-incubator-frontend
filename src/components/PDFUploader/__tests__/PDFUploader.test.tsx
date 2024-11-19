import PDFUploader from '../PDFUploader';
import { fireEvent, render } from '@testing-library/react';
import { Upload } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Button: ({ children, ...props }: any) => (
            <div {...props} data-testid="button">
                {children}
            </div>
        ),
        Upload: {
            Dragger: jest.fn().mockImplementation(({ children, ...props }: any) => (
                <div {...props} data-testid="dragger">
                    {children}
                </div>
            ))
        }
    };
});

jest.mock('@ant-design/icons', () => {
    return {
        ...jest.requireActual('@ant-design/icons'),
        InboxOutlined: ({ children, ...props }: any) => (
            <div {...props} data-testid="inbox-outlined">
                {children}
            </div>
        ),
        RollbackOutlined: ({ children, ...props }: any) => (
            <div {...props} data-testid="rollback-outlined">
                {children}
            </div>
        )
    };
});

jest.mock('../../../utils/notification', () => {
    return {
        ...jest.requireActual('../../../utils/notification'),
        openNotification: jest.fn()
    };
});

describe('PDFUploader', () => {
    const mockOnFileUpload = jest.fn();
    const mockOnRevert = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should call beforeUpload', async () => {
        const file = new File(['file contents'], 'file.pdf', { type: 'application/pdf' });
        render(<PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert} />);
        const mockedDragger = Upload.Dragger as unknown as jest.Mock;

        expect(mockedDragger).toHaveBeenCalledTimes(1);
        const resp = mockedDragger.mock.calls[0][0].beforeUpload(file);
        expect(resp).toBeFalsy();
        expect(mockOnFileUpload).toHaveBeenCalledTimes(1);
    });
    it('should call onChange - status done', async () => {
        const file = { status: 'done', name: 'file.pdf' };
        render(<PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert} />);
        const mockedDragger = Upload.Dragger as unknown as jest.Mock;

        expect(mockedDragger).toHaveBeenCalledTimes(1);
        mockedDragger.mock.calls[0][0].onChange({ file });
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'File uploaded',
            'file.pdf file has been loaded successfully',
            NotificationType.SUCCESS,
            NOTIFICATION_DURATION
        );
    });
    it('should call onChange - status error', async () => {
        const file = { status: 'error', name: 'file.pdf' };
        render(<PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert} />);
        const mockedDragger = Upload.Dragger as unknown as jest.Mock;

        expect(mockedDragger).toHaveBeenCalledTimes(1);
        mockedDragger.mock.calls[0][0].onChange({ file });
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith(
            'Error',
            'file.pdf file upload failed',
            NotificationType.ERROR,
            NOTIFICATION_DURATION
        );
    });
    it('should call onRevert when button is clicked', () => {
        const tree = render(
            <PDFUploader onFileUpload={mockOnFileUpload} onRevert={mockOnRevert} />
        );
        fireEvent.click(tree.getByTestId('button'));
        expect(mockOnRevert).toHaveBeenCalledTimes(1);
    });
});
