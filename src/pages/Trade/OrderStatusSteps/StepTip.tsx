import { Button, Form, FormProps, Input, Popover, Space, Typography } from 'antd';
import { CalendarFilled, MailOutlined } from '@ant-design/icons';
import { differenceInDaysFromToday, fromTimestampToDate } from '@/utils/date';
import React, { ReactNode } from 'react';
import { OrderStatus, OrderTrade } from '@kbc-lib/coffee-trading-management-lib';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
type StepTipProps = {
    orderTrade: OrderTrade;
    message: ReactNode;
    deadline: number;
    status: OrderStatus;
};
export const StepTip = ({ orderTrade, message, deadline, status }: StepTipProps) => {
    const { getOrderStatus, notifyExpiration } = useEthOrderTrade();
    const navigate = useNavigate();

    const deadlineExpiredEmailSend: FormProps['onFinish'] = async (values) => {
        await notifyExpiration(orderTrade.tradeId, values.emailAddress, values.message);
        navigate(paths.TRADES);
    };

    return (
        <div style={{ padding: '0.5rem' }}>
            {message}
            <Space align="center" style={{ width: '100%' }}>
                <Typography.Text strong style={{ fontSize: 'x-large' }}>
                    Deadline:{' '}
                </Typography.Text>
                <CalendarFilled style={{ fontSize: 'large' }} />
                <Typography.Text style={{ fontSize: 'large' }}>
                    {fromTimestampToDate(deadline).toLocaleDateString()}
                </Typography.Text>
                {getOrderStatus(orderTrade.tradeId) === status ? (
                    differenceInDaysFromToday(deadline) > 0 ? (
                        <Typography.Text style={{ fontSize: 'medium', color: 'orange' }}>
                            {`--> Left ${differenceInDaysFromToday(deadline)} days`}
                        </Typography.Text>
                    ) : (
                        <Typography.Text style={{ fontSize: 'medium', color: 'red' }}>
                            --{'> '}
                            <Popover
                                title="Please contact the other party"
                                trigger="click"
                                placement="right"
                                content={
                                    <Form
                                        labelCol={{ span: 10 }}
                                        wrapperCol={{ span: 14 }}
                                        style={{ padding: 20 }}
                                        onFinish={deadlineExpiredEmailSend}>
                                        <Form.Item
                                            name="emailAddress"
                                            label="E-mail address"
                                            rules={[
                                                {
                                                    type: 'email',
                                                    message:
                                                        'The input is not valid E-mail address.'
                                                },
                                                {
                                                    required: true,
                                                    message: 'Please input the E-mail address.'
                                                }
                                            ]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            name="message"
                                            label="Message"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Please input a message for the company.',
                                                    whitespace: true
                                                }
                                            ]}>
                                            <Input.TextArea />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ span: 24 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                style={{ width: '100%' }}>
                                                <MailOutlined style={{ fontSize: 'large' }} /> Send
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                }>
                                <Button type="dashed" danger ghost>
                                    <span style={{ fontSize: 'large' }}>EXPIRED</span>
                                </Button>
                            </Popover>
                        </Typography.Text>
                    )
                ) : (
                    <Typography.Text style={{ fontSize: 'medium', color: 'green' }}>
                        --{'>'} Uploaded on time
                    </Typography.Text>
                )}
            </Space>
        </div>
    );
};
