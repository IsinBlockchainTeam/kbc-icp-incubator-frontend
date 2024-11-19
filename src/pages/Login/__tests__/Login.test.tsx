import { act, render } from '@testing-library/react';
import Login from '@/pages/Login/Login';
import { QRCode, Timeline } from 'antd';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useWalletConnect } from '@/providers/WalletConnectProvider';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';
import { openNotification } from '@/utils/notification';
import { updateUserInfo } from '@/redux/reducers/userInfoSlice';
import { EventEmitter } from 'events';
import { DID_METHOD } from '@/constants/ssi';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Card: ({ children, ...props }: any) => (
        <div {...props} data-testid="card">
            {children}
        </div>
    ),
    QRCode: jest.fn().mockReturnValue(() => <div />),
    Timeline: jest.fn().mockReturnValue(() => <div />)
}));
jest.mock('@/providers/WalletConnectProvider');
jest.mock('react-redux');
jest.mock('uuid');
jest.mock('@/utils/notification');
jest.mock('@/redux/reducers/userInfoSlice');
jest.mock('react-router-dom');
jest.mock('@/utils/request');

describe('Login', () => {
    const mockProvider = {
        on: jest.fn(),
        connect: jest.fn()
    } as unknown as EthereumProvider;
    const dispatch = jest.fn();
    const userInfo = {
        isLogged: false
    };

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
        (useWalletConnect as jest.Mock).mockReturnValue({ provider: mockProvider });
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (uuid as jest.Mock).mockReturnValue('uuid');
    });

    it('should render correctly', () => {
        const tree = render(<Login />);
        expect(tree.getByTestId('card')).toBeInTheDocument();
        expect(Timeline as unknown as jest.Mock).toHaveBeenCalled();
        expect(QRCode as unknown as jest.Mock).toHaveBeenCalled();
    });

    it('should navigate to profile if user is logged in', async () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });
        render(<Login />);
        expect(Navigate).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith(
            {
                to: paths.PROFILE
            },
            {}
        );
    });

    describe('walletConnect', () => {
        it('should connect to provider', async () => {
            await act(async () => {
                render(<Login />);
            });

            expect(mockProvider.on).toHaveBeenCalledTimes(1);
            expect(mockProvider.connect).toHaveBeenCalledTimes(1);
        });

        it('should handle connection error', async () => {
            (mockProvider.connect as jest.Mock).mockReturnValueOnce(
                Promise.reject(new Error('error'))
            );
            await act(async () => {
                render(<Login />);
            });

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('verifiablePresentation', () => {
        it('should request auth presentation', async () => {
            await act(async () => {
                render(<Login />);
            });
            expect(dispatch).toHaveBeenCalledTimes(1);
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
        });

        it('should open a notification if auth request fails', async () => {
            (request as jest.Mock).mockRejectedValue(new Error('error'));
            await act(async () => {
                render(<Login />);
            });
            expect(dispatch).toHaveBeenCalledTimes(1);
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
                            id: '123',
                            credentialSubject: {
                                id: 'id',
                                subjectDid: 'subjectDid',
                                legalName: 'name',
                                email: 'email',
                                address: 'address',
                                nation: 'nation',
                                telephone: 'telephone',
                                image: 'image',
                                role: 'role',
                                organizationId: 'organizationId'
                            },
                            issuer: {
                                id: DID_METHOD + ':456'
                            },
                            expirationDate: new Date(1),
                            signedProof: 'signedProof'
                        },
                        {
                            id: '456',
                            credentialSubject: {
                                id: 'id',
                                subjectDid: 'subjectDid',
                                firstName: 'firstName',
                                lastName: 'lastName',
                                email: 'email',
                                address: 'address',
                                birthDate: 'birthDate'
                            },
                            issuer: {
                                id: DID_METHOD + ':123'
                            },
                            expirationDate: new Date(1),
                            signedProof: 'signedProof'
                        }
                    ]
                }
            };
            (request as jest.Mock).mockResolvedValueOnce(message);
            await act(async () => {
                render(<Login />);
            });
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(request).toHaveBeenCalledTimes(2);
            expect(request).toHaveBeenNthCalledWith(
                2,
                `${requestPath.VERIFIER_BACKEND_URL}/presentations/callback/validated?challengeId=uuid`,
                { method: 'GET' }
            );
            const {
                id: companyId,
                subjectDid: companyDid,
                ...companyClaims
            } = message.body.verifiableCredential[0].credentialSubject;
            const {
                id: employeeId,
                subjectDid: employeeDid,
                ...employeeClaims
            } = message.body.verifiableCredential[1].credentialSubject;
            expect(updateUserInfo).toHaveBeenCalledWith({
                subjectDid: employeeDid,
                companyClaims,
                employeeClaims,
                roleProof: {
                    delegator: '123',
                    signedProof: 'signedProof',
                    delegateCredentialIdHash: '456',
                    delegateCredentialExpiryDate: 0,
                    membershipProof: {
                        signedProof: 'signedProof',
                        delegatorCredentialIdHash: '123',
                        delegatorCredentialExpiryDate: 0,
                        issuer: '456'
                    }
                }
            });
            jest.useRealTimers();
        });

        it('should open a notification if fetch auth response fails', async () => {
            jest.useFakeTimers(); // mock timers
            const response = { qrcode: 'qrcode' };
            (request as jest.Mock).mockResolvedValueOnce(response);
            (request as jest.Mock).mockRejectedValueOnce(new Error('error'));
            await act(async () => {
                render(<Login />);
            });
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
            expect(request).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalled();
            jest.useRealTimers();
        });
        it('should open a notification if subject is not available', async () => {
            jest.useFakeTimers(); // mock timers
            const response = { qrcode: 'qrcode' };
            (request as jest.Mock).mockResolvedValueOnce(response);
            const message = {
                body: {}
            };
            (request as jest.Mock).mockResolvedValueOnce(message);
            await act(async () => {
                render(<Login />);
            });
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
            expect(request).toHaveBeenCalledTimes(2);
            expect(openNotification).toHaveBeenCalled();
            jest.useRealTimers();
        });
    });

    it('should set qrCodeURL', async () => {
        const mockProvider = new EventEmitter();
        (useWalletConnect as jest.Mock).mockReturnValueOnce({ provider: mockProvider });
        const response = { qrcode: 'vp_url' };
        (request as jest.Mock).mockResolvedValueOnce(response);

        await act(async () => {
            render(<Login />);
        });
        act(() => {
            mockProvider.emit('display_uri', 'wc_uri');
        });

        expect(QRCode).toHaveBeenCalledWith(
            {
                status: 'active',
                value: JSON.stringify({
                    type: 'login_request',
                    params: {
                        wc_uri: 'wc_uri',
                        vp_url: 'vp_url'
                    }
                }),
                size: expect.any(Number)
            },
            {}
        );
    });
});
