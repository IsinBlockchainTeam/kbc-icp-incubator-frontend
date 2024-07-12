import { Button, Form, FormProps, Input, Modal } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import React from 'react';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { requestPath } from '@/constants/url';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { COMPANY_MESSAGE } from '@/constants/message';

type Props = {
    open: boolean;
    onClose: () => void;
};
type FieldType = {
    name?: string;
    email?: string;
};
export const InviteCompany = (props: Props) => {
    const dispatch = useDispatch();
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            dispatch(addLoadingMessage(COMPANY_MESSAGE.INVITE.LOADING));
            const response = await fetch(requestPath.EMAIL_SENDER_URL + '/email/invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            if (response.ok) {
                openNotification(
                    'Success',
                    COMPANY_MESSAGE.INVITE.OK,
                    NotificationType.SUCCESS,
                    NOTIFICATION_DURATION
                );
                props.onClose();
            } else {
                openNotification(
                    'Error',
                    COMPANY_MESSAGE.INVITE.ERROR,
                    NotificationType.ERROR,
                    NOTIFICATION_DURATION
                );
            }
        } catch (e: any) {
            openNotification(
                'Error',
                COMPANY_MESSAGE.INVITE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(COMPANY_MESSAGE.INVITE.LOADING));
        }
    };

    return (
        <Modal open={props.open} title="Invite a new Company" onCancel={props.onClose} footer={[]}>
            <Form
                name="invite"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600, paddingTop: 20 }}
                onFinish={onFinish}
                autoComplete="off">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the company name.',
                            whitespace: true
                        }
                    ]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                        {
                            type: 'email',
                            message: 'The input is not valid E-mail address.'
                        },
                        {
                            required: true,
                            message: 'Please input the E-mail address.'
                        }
                    ]}>
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                    <Button type="primary" htmlType="submit" block style={{ width: '100%' }}>
                        Invite
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
