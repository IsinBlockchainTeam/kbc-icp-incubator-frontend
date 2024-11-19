import React from 'react';
import { render } from '@testing-library/react';
import RangePicker from '../RangePicker';

describe('RangePicker', () => {
    it('should render with default props', () => {
        const { getAllByRole } = render(<RangePicker />);
        const rangePickers = getAllByRole('range-picker');
        for (const rangePicker of rangePickers) expect(rangePicker).toBeInTheDocument();
    });
});
