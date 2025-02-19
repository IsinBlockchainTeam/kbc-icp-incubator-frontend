import { render, screen } from '@testing-library/react';
import { InfoCard } from '../InfoCard';

describe('InfoCard', () => {
    const defaultProps = {
        title: 'Test Title',
        items: ['Item 1', 'Item 2', 'Item 3'],
    };

    it('renders correctly', () => {
        render(<InfoCard {...defaultProps} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
});