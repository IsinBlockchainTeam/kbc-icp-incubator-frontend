import React from 'react';
import { render } from '@testing-library/react';
import DatePicker from '../DatePicker';

describe('DatePicker', () => {
    it('should render with default props', () => {
        const { getByRole } = render(<DatePicker />);
        const datePicker = getByRole('date-picker');
        expect(datePicker).toBeInTheDocument();
    });
});
