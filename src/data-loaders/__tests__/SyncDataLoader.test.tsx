import React from 'react';
import { render, screen } from '@testing-library/react';
import SyncDataLoader from '../SyncDataLoader';

jest.mock('@/components/Loading/LoadingPage', () => ({
    __esModule: true,
    LoadingPage: () => <div>Loading...</div>
}));

describe('SyncDataLoader', () => {
    it('loads data on initial render when data is not loaded', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: false,
            loadData: jest.fn()
        });

        render(<SyncDataLoader customUseContext={useContextMock} children={<div />} />);

        expect(useContextMock().loadData).toHaveBeenCalled();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not load data on initial render when data is already loaded', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: true,
            loadData: jest.fn()
        });

        render(<SyncDataLoader customUseContext={useContextMock} children={<div />} />);

        expect(useContextMock().loadData).not.toHaveBeenCalled();
    });

    it('renders children', () => {
        const useContextMock = jest.fn().mockReturnValue({
            dataLoaded: true,
            loadData: jest.fn()
        });

        const { getByText } = render(<SyncDataLoader customUseContext={useContextMock} children={<div>Test Child</div>} />);

        expect(getByText('Test Child')).toBeInTheDocument();
    });
});
