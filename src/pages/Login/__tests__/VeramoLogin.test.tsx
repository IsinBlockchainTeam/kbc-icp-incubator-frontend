import { act, render } from '@testing-library/react';
import VeramoLogin from '@/pages/Login/VeramoLogin';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { request } from '@/utils/request';
import { QRCode } from 'antd';
import { v4 as uuid } from 'uuid';
import { requestPath } from '@/constants/url';
import { openNotification } from '@/utils/notification';
import { updateUserInfo } from '@/redux/reducers/userInfoSlice';

jest.mock('react-redux');
jest.mock('uuid');
jest.mock('@/utils/notification');
jest.mock('@/redux/reducers/userInfoSlice');
jest.mock('react-router-dom');
jest.mock('@/utils/request');
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    QRCode: jest.fn().mockReturnValue(() => <div />),
    Timeline: jest.fn().mockReturnValue(() => <div />)
}));

describe('VeramoLogin', () => {
    const dispatch = jest.fn();
    const userInfo = {
        isLogged: false
    };
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (uuid as jest.Mock).mockReturnValue('uuid');
    });

    it('should navigate to profile if user is logged in', async () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });
        render(<VeramoLogin />);
        expect(Navigate).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith(
            {
                to: paths.PROFILE
            },
            {}
        );
    });
    it('should request auth presentation and show qr code', async () => {
        const response = { qrcode: 'qrcode' };
        (request as jest.Mock).mockResolvedValue(response);
        await act(async () => {
            render(<VeramoLogin />);
        });
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenCalled();
        expect(request).toHaveBeenCalledWith(
            `${requestPath.VERIFIER_BACKEND_URL}/presentations/create/selective-disclosure`,
            {
                method: 'POST',
                body: JSON.stringify({
                    tag: 'uuid',
                    claimType: 'legalName',
                    reason: 'Please, authenticate yourself'
                })
            }
        );
        expect(QRCode).toHaveBeenCalledTimes(2);
        expect(QRCode).toHaveBeenNthCalledWith(
            2,
            {
                status: 'active',
                value: 'qrcode',
                size: 300
            },
            {}
        );
    });
    it('should open a notification if auth request fails', async () => {
        (request as jest.Mock).mockRejectedValue(new Error('error'));
        await act(async () => {
            render(<VeramoLogin />);
        });
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenCalled();
        expect(openNotification).toHaveBeenCalled();
    });
    it('should periodically fetch auth response', async () => {
        jest.useFakeTimers(); // mock timers
        const response = { qrcode: 'qrcode' };
        (request as jest.Mock).mockResolvedValueOnce(response);
        const message = {
            body: {
                holder: 'subjectDid',
                verifiableCredential: [
                    {
                        credentialSubject: {
                            id: 'id',
                            legalName: 'name',
                            email: 'email',
                            address: 'address',
                            nation: 'nation',
                            telephone: 'telephone',
                            image: 'image',
                            role: 'role',
                            organizationId: 'organizationId',
                            privateKey: 'privateKey'
                        }
                    }
                ]
            }
        };
        (request as jest.Mock).mockResolvedValueOnce(message);
        await act(async () => {
            render(<VeramoLogin />);
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(request).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenNthCalledWith(
            2,
            `${requestPath.VERIFIER_BACKEND_URL}/presentations/callback/validated?challengeId=uuid`,
            { method: 'GET' }
        );
        expect(updateUserInfo).toHaveBeenCalledWith(
            message.body.verifiableCredential[0].credentialSubject
        );
        jest.useRealTimers();
    });
    it('should open a notification if fetch auth response fails', async () => {
        jest.useFakeTimers(); // mock timers
        const response = { qrcode: 'qrcode' };
        (request as jest.Mock).mockResolvedValueOnce(response);
        (request as jest.Mock).mockRejectedValueOnce(new Error('error'));
        await act(async () => {
            render(<VeramoLogin />);
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(request).toHaveBeenCalledTimes(2);
        expect(openNotification).toHaveBeenCalled();
        jest.useRealTimers();
    });
    it('should open a notification if subject is not availbale', async () => {
        jest.useFakeTimers(); // mock timers
        const response = { qrcode: 'qrcode' };
        (request as jest.Mock).mockResolvedValueOnce(response);
        const message = {
            body: {}
        };
        (request as jest.Mock).mockResolvedValueOnce(message);
        await act(async () => {
            render(<VeramoLogin />);
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(request).toHaveBeenCalledTimes(2);
        expect(openNotification).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
