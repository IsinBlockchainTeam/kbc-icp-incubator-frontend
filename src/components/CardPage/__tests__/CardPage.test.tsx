import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardPage } from '../CardPage';

describe('CardPage', () => {
    it('should render with title', () => {
        const title = 'Test Title';
        render(<CardPage title={title} />);
        expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should render with extra content', () => {
        const title = 'Test Title';
        const extra = 'Extra Content';
        render(<CardPage title={title} extra={extra} />);
        expect(screen.getByText(extra)).toBeInTheDocument();
    });

    it('should render with children', () => {
        const title = 'Test Title';
        const children = 'Child Content';
        render(<CardPage title={title}>{children}</CardPage>);
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('should render without extra content', () => {
        const title = 'Test Title';
        render(<CardPage title={title} />);
        expect(screen.queryByText('Extra Content')).not.toBeInTheDocument();
    });
});
