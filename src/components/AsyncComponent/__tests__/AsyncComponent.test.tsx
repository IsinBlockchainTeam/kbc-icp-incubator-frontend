import { render, screen } from '@testing-library/react';
import { AsyncComponent, AsyncComponentProps } from '../AsyncComponent';

const mockAsyncFunction = jest.fn();

describe('AsyncComponent', () => {
    const defaultProps: AsyncComponentProps<string> = {
        asyncFunction: mockAsyncFunction,
        defaultElement: <div>Default Element</div>
    };

    it('renders value when async function resolves', async () => {
        mockAsyncFunction.mockResolvedValue('Resolved Value');
        render(<AsyncComponent {...defaultProps} />);
        expect(await screen.findByText('Resolved Value')).toBeInTheDocument();
    });

    it('renders default element when async function rejects', async () => {
        mockAsyncFunction.mockRejectedValue(new Error('Error'));
        render(<AsyncComponent {...defaultProps} />);
        expect(await screen.findByText('Default Element')).toBeInTheDocument();
    });
});
