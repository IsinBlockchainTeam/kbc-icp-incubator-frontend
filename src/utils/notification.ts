import {notification} from "antd";

export enum NotificationType {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error'
}
export const openNotification = (title: string, message: string, type: NotificationType) => {
    notification[type]({
        message: title,
        description: message
    })
}
