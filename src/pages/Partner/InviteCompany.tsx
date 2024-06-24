import { Button, Form, FormProps, Input, Modal } from 'antd';
import { NotificationType, openNotification } from '@/utils/notification';
import React, { useEffect } from 'react';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { requestPath } from '@/constants/url';
import { notificationDuration } from '@/constants/notification';

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
            dispatch(showLoading('Inviting company...'));
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
                    'Company invited successfully',
                    NotificationType.SUCCESS,
                    notificationDuration
                );
                props.onClose();
            } else {
                openNotification(
                    'Error',
                    'Failed to invite company',
                    NotificationType.ERROR,
                    notificationDuration
                );
            }
        } catch (e: any) {
            openNotification('Error', e.message, NotificationType.ERROR, notificationDuration);
        } finally {
            dispatch(hideLoading());
        }
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        errorInfo.errorFields.forEach((field) => {
            openNotification(
                'Error',
                field.errors[0],
                NotificationType.ERROR,
                notificationDuration
            );
        });
    };

    useEffect(() => {
        return () => {
            dispatch(hideLoading());
        };
    }, []);

    return (
        <Modal open={props.open} title="Invite a new Company" onCancel={props.onClose} footer={[]}>
            <Form
                name="invite"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600, paddingTop: 20 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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
