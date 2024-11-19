import React from 'react';
import { render, screen } from '@testing-library/react';
import { GenericCard } from '../GenericCard';

describe('GenericCard', () => {
    it('should render with title and elements', () => {
        const title = 'Test Title';
        const elements = [
            { name: 'Name1', value: 'Value1' },
            { name: 'Name2', value: 'Value2' }
        ];

        render(<GenericCard title={title} elements={elements} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        elements.forEach((item) => {
            expect(screen.getByText(`${item.name}: ${item.value}`)).toBeInTheDocument();
        });
    });

    it('should render with icon', () => {
        const title = 'Test Title';
        const elements = [
            { name: 'Name1', value: 'Value1' },
            { name: 'Name2', value: 'Value2' }
        ];
        const icon = <div data-testid="icon">Icon</div>;

        render(<GenericCard title={title} elements={elements} icon={icon} />);

        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render without value in elements', () => {
        const title = 'Test Title';
        const elements = [{ name: 'Name1' }, { name: 'Name2' }];

        render(<GenericCard title={title} elements={elements} />);

        elements.forEach((item) => {
            expect(screen.getByText(`${item.name}:`)).toBeInTheDocument();
        });
    });
});
