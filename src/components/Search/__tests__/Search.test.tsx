import React from 'react';
import { render } from '@testing-library/react';
import Search from '../Search';
import { Input } from 'antd';

const AntdSearch = Input.Search;

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Input: {
        Search: jest.fn().mockImplementation(({ children, ...props }: any) => (
            <div {...props} data-testid="search">
                {children}
            </div>
        ))
    }
}));

describe('Search', () => {
    const onSearchFn = jest.fn();

    it('should render with placeholder', () => {
        render(<Search placeholder="Search here..." onSearchFn={onSearchFn} />);
        expect(AntdSearch as unknown as jest.Mock).toHaveBeenCalled();
    });

    it('should call onSearchFn when enter button is pressed', () => {
        render(<Search placeholder="Search here..." onSearchFn={onSearchFn} />);
        expect(AntdSearch as unknown as jest.Mock).toHaveBeenCalled();
        (AntdSearch as unknown as jest.Mock).mock.calls[0][0].onSearch('test');
        expect(onSearchFn).toHaveBeenCalledWith('test');
    });
});
