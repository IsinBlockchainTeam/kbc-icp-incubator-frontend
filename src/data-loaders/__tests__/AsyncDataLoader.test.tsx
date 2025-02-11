import React from 'react';
import { render } from '@testing-library/react';
import AsyncDataLoader from '../AsyncDataLoader';

describe('AsyncDataLoader', () => {
    it('loads data on initial render when data is not loaded', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: false,
            loadData: jest.fn()
        });

        render(<AsyncDataLoader customUseContext={useContextMock} children={<div />} />);

        expect(useContextMock().loadData).toHaveBeenCalled();
    });

    it('does not load data on initial render when data is already loaded', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: true,
            loadData: jest.fn()
        });

        render(<AsyncDataLoader customUseContext={useContextMock} children={<div />} />);

        expect(useContextMock().loadData).not.toHaveBeenCalled();
    });

    it('renders children', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: true,
            loadData: jest.fn()
        });

        const { getByText } = render(<AsyncDataLoader customUseContext={useContextMock} children={<div>Test Child</div>} />);

        expect(getByText('Test Child')).toBeInTheDocument();
    });
});
