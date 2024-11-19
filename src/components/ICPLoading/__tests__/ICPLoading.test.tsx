import React from 'react';
import { render } from '@testing-library/react';
import ICPLoading from '../ICPLoading';

describe('ICPLoading', () => {
    it('should render with default props', () => {
        const { getByRole } = render(<ICPLoading />);
        const image = getByRole('img');
        const title = getByRole('heading');
        expect(image).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(title.textContent).toBe('We are deriving your Internet Identity...');
    });

    it('should have correct image source', () => {
        const { getByRole } = render(<ICPLoading />);
        const image = getByRole('img');
        expect(image.getAttribute('src')).toBe('./assets/icp-logo.png');
    });
});
