import { notification } from 'antd';
import {ReactNode} from "react";

export enum NotificationType {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error'
}
export const openNotification = (
    title: string,
    message: ReactNode,
    type: NotificationType,
    duration?: number
) => {
    notification[type]({
        message: title,
        description: message,
        duration
    });
};
