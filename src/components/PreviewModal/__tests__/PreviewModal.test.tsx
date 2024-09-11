import { act, render, screen } from '@testing-library/react';
import { PreviewModal, PreviewModalProps } from '../PreviewModal';
import userEvent from '@testing-library/user-event';
import { Viewer } from '@react-pdf-viewer/core';

jest.mock('@react-pdf-viewer/core');

describe('PreviewModal', () => {
    const mockGetDocument = jest.fn();
    const defaultProps: PreviewModalProps = {
        open: true,
        getDocument: mockGetDocument,
        onClose: jest.fn()
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders loading spinner while loading document', async () => {
        mockGetDocument.mockReturnValue(new Promise(() => {}));
        render(<PreviewModal {...defaultProps} />);
        expect(screen.getByRole('loading')).toBeInTheDocument();
    });

    it('renders document when getDocument resolves', async () => {
        URL.createObjectURL = jest.fn();
        const blob = new Blob(['test'], { type: 'application/pdf' });
        mockGetDocument.mockResolvedValue(blob);
        await act(async () => render(<PreviewModal {...defaultProps} />));
        expect(Viewer).toHaveBeenCalled();
        expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    });

    it('renders nothing when getDocument resolves to null', async () => {
        mockGetDocument.mockResolvedValue(null);
        render(<PreviewModal {...defaultProps} />);
        expect(screen.queryByRole('document')).not.toBeInTheDocument();
    });

    it('renders nothing when modal is closed', () => {
        render(<PreviewModal {...defaultProps} open={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when modal is closed', () => {
        render(<PreviewModal {...defaultProps} />);
        userEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
