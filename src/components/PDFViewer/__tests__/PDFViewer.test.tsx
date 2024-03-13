import {fireEvent, render} from "@testing-library/react";
import PDFViewer from "../PDFViewer";
import {FormElement, FormElementType} from "../../GenericForm/GenericForm";

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Spin: ({children, ...props}: any) => <div {...props} data-testid="spin">{children}</div>,
    };
});

jest.mock('@ant-design/icons', () => {
    return {
        ...jest.requireActual('@ant-design/icons'),
        ContainerTwoTone: ({children, ...props}: any) => <div {...props} data-testid="container-icon">{children}</div>,
    }
});

jest.mock('@react-pdf-viewer/core', () => {
    return {
        Viewer: ({children, ...props}: any) => <div {...props} data-testid="viewer">{children}</div>,
    };
});

jest.mock('../../PDFUploader/PDFUploader', () => {
    return {
        __esModule: true,
        default: function PDFUploaderMock({children, ...props}: any) {
            return <div {...props} data-testid="pdfuploader">{children}
                <button onClick={props.onFileUpload} data-testId={"test-onFileUpload"}>onFileUpload</button>
            </div>;
        },
    }
});

describe('PDFViewer', () => {
    const mockedURLCreateObjectURL = jest.fn();
    const actual = URL.createObjectURL;
    const element: FormElement = {
        type: FormElementType.DOCUMENT,
        span: 24,
        name: 'document',
        label: 'Document 1',
        required: true,
        content: new Blob(),
        uploadable: true,
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
        const tree = render(<PDFViewer element={element} onDocumentChange={jest.fn()}/>);

        expect(tree.getByTestId('viewer')).toBeInTheDocument();
        expect(tree.getByTestId('pdfuploader')).toBeInTheDocument();
        expect(mockedURLCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockedURLCreateObjectURL).toHaveBeenCalledWith(element.content);
    });
    it('should call onFileUpload', () => {
        const tree = render(<PDFViewer element={element} onDocumentChange={jest.fn()}/>);

        expect(tree.getByTestId('test-onFileUpload')).toBeInTheDocument();
        fireEvent.click(tree.getByTestId('test-onFileUpload'));
    });
});