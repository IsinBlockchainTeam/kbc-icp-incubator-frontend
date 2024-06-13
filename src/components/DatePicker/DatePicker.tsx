import React from 'react';
import { DatePicker } from 'antd';
import { utils } from '@/constants/index';

type Props = {
    style?: any;
    defaultValue?: any;
    value?: any;
};
export default (props: Props) => {
    const { style, ...additionalProps } = props;

    return (
        <DatePicker
            role="date-picker"
            style={{ width: '100%', ...style }}
            {...additionalProps}
            format={utils.DATE_FORMAT}
        />
    );
};
