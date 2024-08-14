import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PDFGenerationView from '@/components/PDFViewer/PDFGenerationView';
import { createDownloadWindow } from '@/utils/page';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Modal: ({ children, footer, ...props }: any) => (
            <div {...props} data-testid="modal">
                {children}
                <div data-testid="footer">
                    {typeof footer === 'function' ? footer({}, {}) : footer}
                </div>
            </div>
        ),
        Button: ({ children, ...props }: any) => (
            <button {...props} data-testid="button">
                {children}
            </button>
        )
    };
});
jest.mock('@react-pdf-viewer/core', () => {
    return {
        Viewer: ({ children, ...props }: any) => (
            <div {...props} data-testid="viewer">
                {children}
            </div>
        ),
        SpecialZoomLevel: {
            PageWidth: 'PageWidth'
        }
    };
});
jest.mock('@ant-design/icons', () => {
    return {
        ...jest.requireActual('@ant-design/icons'),
        DownloadOutlined: ({ children, ...props }: any) => (
            <div {...props} data-testid="download-outlined">
                {children}
            </div>
        )
    };
});
jest.mock('@/utils/page');

describe('PDFGenerationView', () => {
    const actual = URL.createObjectURL;
    const mockedURLCreateObjectURL = jest.fn();
    const mockedGeneratePdf = jest.fn();
    const mockedCreateDownloadWindow = jest.fn();

    const mockedPdf = new Blob();

    beforeEach(() => {
        URL.createObjectURL = mockedURLCreateObjectURL;
        mockedGeneratePdf.mockImplementation(() => Promise.resolve(mockedPdf));
        (createDownloadWindow as jest.Mock).mockImplementation(mockedCreateDownloadWindow);
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => {
        URL.createObjectURL = actual;
    });

    it('should render correctly, but not visible', () => {
        const result = render(
            <PDFGenerationView
                title={'Test modal'}
                visible={false}
                handleClose={jest.fn()}
                useGeneration={{ generateJsonSpec: jest.fn(), generatePdf: mockedGeneratePdf }}
            />
        );

        expect(result.getByTitle('Test modal')).toBeInTheDocument();
        expect(result.getByTestId('modal')).toBeInTheDocument();
        expect(result.queryByTestId('viewer')).toBeFalsy();
        expect(result.queryByTestId('button')).toBeFalsy();
        // not visible
        expect(mockedGeneratePdf).not.toHaveBeenCalled();
    });

    it('should render correctly visible and with download button', async () => {
        const result = render(
            <PDFGenerationView
                title={'Test modal'}
                visible={true}
                handleClose={jest.fn()}
                useGeneration={{ generateJsonSpec: jest.fn(), generatePdf: mockedGeneratePdf }}
                downloadable={true}
                filename={'test.pdf'}
            />
        );

        await waitFor(() => {
            expect(mockedGeneratePdf).toHaveBeenCalled();
        });

        expect(screen.getByText(/Download/)).toBeInTheDocument();

        expect(result.getByTestId('viewer')).toBeInTheDocument();

        expect(mockedURLCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockedGeneratePdf).toHaveBeenCalled();
    });

    it('should create download window after clicking download button', async () => {
        const mockedHandleClose = jest.fn();
        render(
            <PDFGenerationView
                title={'Test modal'}
                visible={true}
                handleClose={mockedHandleClose}
                useGeneration={{ generateJsonSpec: jest.fn(), generatePdf: mockedGeneratePdf }}
                downloadable={true}
                filename={'test.pdf'}
            />
        );

        await waitFor(() => {
            expect(mockedGeneratePdf).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByText(/Download/));

        expect(mockedCreateDownloadWindow).toHaveBeenCalledTimes(1);
        expect(mockedCreateDownloadWindow).toHaveBeenNthCalledWith(1, mockedPdf, 'test.pdf');
        expect(mockedHandleClose).not.toHaveBeenCalled();
    });
});
