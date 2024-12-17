import { MenuProps } from 'antd';
import React from 'react';

export type MenuItem = Required<MenuProps>['items'][number];

export const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
    onClick?: () => void
): MenuItem => {
    return {
        key,
        icon,
        children,
        label,
        type,
        onClick
    } as MenuItem;
};
