import React from "react";
import {utils} from "@/constants/index";
import {DatePicker} from "antd";
const {RangePicker} = DatePicker;

type Props = {
    style?: any,
    defaultValue?: any,
    value?: any
}
export default (props: Props) => {
    const {
        style,
        ...additionalProps
    } = props;

    return (
        <RangePicker style={{width: '100%', ...style}} {...additionalProps} format={utils.DATE_FORMAT} />
    )
}
