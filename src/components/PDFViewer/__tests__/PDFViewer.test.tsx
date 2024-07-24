import { fireEvent, render } from '@testing-library/react';
import PDFViewer from '../PDFViewer';
import { DocumentElement, FormElement, FormElementType } from '../../GenericForm/GenericForm';
import { PDFUploaderProps } from '../../PDFUploader/PDFUploader';
import { DocumentContent } from '@/providers/entities/EthDocumentProvider';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Spin: ({ children, ...props }: any) => (
            <div {...props} data-testid="spin">
                {children}
            </div>
        ),
        Empty: ({ children, ...props }: any) => (
            <div {...props} data-testid="empty">
                {children}
            </div>
        )
    };
});

jest.mock('@ant-design/icons', () => {
    return {
        ...jest.requireActual('@ant-design/icons'),
        ContainerTwoTone: ({ children, ...props }: any) => (
            <div {...props} data-testid="container-icon">
                {children}
            </div>
        )
    };
});

jest.mock('@react-pdf-viewer/core', () => {
    return {
        Viewer: ({ children, ...props }: any) => (
            <div {...props} data-testid="viewer">
                {children}
            </div>
        )
    };
});

const mockedFile: Blob = new Blob();
jest.mock('../../PDFUploader/PDFUploader', () => ({ onFileUpload, onRevert }: PDFUploaderProps) => (
    <div data-testid="pdfuploader">
        <button data-testid="test-onFileUpload" onClick={() => onFileUpload(mockedFile)}>
            onFileUpload
        </button>
        <button data-testid="test-onRevert" onClick={() => onRevert()}>
            onRevert
        </button>
    </div>
));

describe('PDFViewer', () => {
    const mockedURLCreateObjectURL = jest.fn();
    const actual = URL.createObjectURL;
    const element: DocumentElement = {
        type: FormElementType.DOCUMENT,
        span: 24,
        name: 'document',
        label: 'Document 1',
        required: true,
        uploadable: true,
        content: {
            content: mockedFile
        } as DocumentContent,
        loading: false
    };
    beforeAll(() => {
        URL.createObjectURL = mockedURLCreateObjectURL;
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => {
        URL.createObjectURL = actual;
    });
    it('should render correctly', () => {
        const tree = render(<PDFViewer element={element} onDocumentChange={jest.fn()} />);

        expect(tree.getByTestId('viewer')).toBeInTheDocument();
        expect(tree.getByTestId('pdfuploader')).toBeInTheDocument();
        expect(mockedURLCreateObjectURL).toHaveBeenCalledTimes(1);
    });
    it('should call onFileUpload and onRevert', () => {
        const tree = render(<PDFViewer element={element} onDocumentChange={jest.fn()} />);

        expect(tree.getByTestId('test-onFileUpload')).toBeInTheDocument();
        fireEvent.click(tree.getByTestId('test-onFileUpload'));
        expect(tree.getByTestId('test-onRevert')).toBeInTheDocument();
        fireEvent.click(tree.getByTestId('test-onRevert'));
    });
    it('should render correctly with no content', () => {
        const emptyElement: FormElement = {
            ...element,
            content: undefined
        };
        const tree = render(<PDFViewer element={emptyElement} onDocumentChange={jest.fn()} />);

        expect(tree.getByTestId('empty')).toBeInTheDocument();
    });
    it('should render correctly with loading', () => {
        const loadingElement: FormElement = {
            ...element,
            loading: true
        };
        const tree = render(<PDFViewer element={loadingElement} onDocumentChange={jest.fn()} />);

        expect(tree.getByTestId('spin')).toBeInTheDocument();
    });
    it('should render correctly with no uploadable', () => {
        const uploadableElement: FormElement = {
            ...element,
            uploadable: false
        };
        const tree = render(<PDFViewer element={uploadableElement} onDocumentChange={jest.fn()} />);

        expect(tree.queryByTestId('pdfuploader')).not.toBeInTheDocument();
        expect(tree.getByTestId('viewer')).toBeInTheDocument();
    });
});
