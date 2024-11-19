import { notification } from 'antd';
import { ReactNode } from 'react';
import { NotificationType, openNotification } from '@/utils/notification';

jest.mock('antd', () => ({
    notification: {
        success: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        error: jest.fn()
    }
}));

describe('openNotification', () => {
    const mockNotification = notification as jest.Mocked<typeof notification>;
    const title = 'Test Title';
    const message: ReactNode = 'Test Message';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls the correct notification type with provided arguments', () => {
        openNotification(title, message, NotificationType.SUCCESS);
        expect(mockNotification.success).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration: undefined
        });

        openNotification(title, message, NotificationType.INFO);
        expect(mockNotification.info).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration: undefined
        });

        openNotification(title, message, NotificationType.WARNING);
        expect(mockNotification.warning).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration: undefined
        });

        openNotification(title, message, NotificationType.ERROR);
        expect(mockNotification.error).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration: undefined
        });
    });

    it('calls the correct notification type with provided arguments and duration', () => {
        const duration = 5;

        openNotification(title, message, NotificationType.SUCCESS, duration);
        expect(mockNotification.success).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration
        });

        openNotification(title, message, NotificationType.INFO, duration);
        expect(mockNotification.info).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration
        });

        openNotification(title, message, NotificationType.WARNING, duration);
        expect(mockNotification.warning).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration
        });

        openNotification(title, message, NotificationType.ERROR, duration);
        expect(mockNotification.error).toHaveBeenCalledWith({
            message: title,
            description: message,
            duration
        });
    });
});
