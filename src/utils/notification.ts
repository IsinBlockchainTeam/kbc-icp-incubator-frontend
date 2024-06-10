import { notification } from 'antd';

export enum NotificationType {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error'
}
export const openNotification = (
    title: string,
    message: string,
    type: NotificationType,
    duration?: number
) => {
    notification[type]({
        message: title,
        description: message,
        duration
    });
};
