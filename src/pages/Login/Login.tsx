import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Card, QRCode, Space, Timeline } from 'antd';
import { useWalletConnect } from '@/providers/WalletConnectProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { LOGIN_MESSAGE } from '@/constants/message';
import { v4 as uuid } from 'uuid';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { updateUserInfo } from '@/redux/reducers/userInfoSlice';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { DID_METHOD } from '@/constants/ssi';

export const Login = () => {
    const { provider } = useWalletConnect();
    const dispatch = useDispatch();
    const [qrCodeURL, setQrCodeURL] = useState<string>();
    const [walletConnectURI, setWalletConnectURI] = useState<string>();
    const [verifiablePresentationURL, setVerifiablePresentationURL] = useState<string>();
    const [challengeId, setChallengeId] = useState<string>();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    useEffect(() => {
        requestAuthPresentation();
    }, []);

    useEffect(() => {
        if (!walletConnectURI || !verifiablePresentationURL) return;
        const message = JSON.stringify({
            type: 'login_request',
            params: {
                wc_uri: walletConnectURI,
                vp_url: verifiablePresentationURL
            }
        });
        setQrCodeURL(message);
        dispatch(removeLoadingMessage(LOGIN_MESSAGE.COMPUTE.LOADING));
    }, [walletConnectURI, verifiablePresentationURL]);

    useEffect(() => {
        if (!provider) return;
        provider.on('display_uri', (uri: string) => {
            setWalletConnectURI(uri);
        });

        (async () => {
            try {
                await provider.connect();
            } catch (e) {
                console.error('Connection error', e);
            }
        })();
    }, [provider]);

    useEffect(() => {
        if (challengeId) {
            const interval = setInterval(async () => {
                await fetchResponse(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [challengeId]);

    const requestAuthPresentation = async () => {
        try {
            dispatch(addLoadingMessage(LOGIN_MESSAGE.COMPUTE.LOADING));
            const id = uuid();
            const response = await request(
                `${requestPath.VERIFIER_BACKEND_URL}/presentations/create/selective-disclosure`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        tag: id,
                        claimType: 'legalName',
                        reason: 'Please, authenticate yourself'
                    })
                }
            );
            setVerifiablePresentationURL(response.qrcode);
            setChallengeId(id);
        } catch (e: any) {
            openNotification(
                'Error',
                LOGIN_MESSAGE.COMPUTE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        }
    };

    const fetchResponse = async (interval: any) => {
        try {
            const message = await request(
                `${requestPath.VERIFIER_BACKEND_URL}/presentations/callback/validated?challengeId=${challengeId}`,
                { method: 'GET' }
            );
            if (message) {
                console.log('MESSAGE', message);
                clearInterval(interval);
                setChallengeId('');
                const subjectDid = message.body.holder;
                if (!subjectDid) {
                    openNotification(
                        'Error',
                        'No subject DID found',
                        NotificationType.ERROR,
                        NOTIFICATION_DURATION
                    );
                    return;
                }
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
                dispatch(
                    updateUserInfo({
                        subjectDid: employeeDid,
                        companyClaims,
                        employeeClaims,
                        roleProof: {
                            signedProof: message.body.verifiableCredential[1].signedProof,
                            delegator: message.body.verifiableCredential[1].issuer.id.split(
                                DID_METHOD + ':'
                            )[1],
                            delegateCredentialIdHash: message.body.verifiableCredential[1].id
                        }
                    })
                );
            }
        } catch (error: any) {
            openNotification(
                'Error',
                'Error while processing VC',
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
            clearInterval(interval);
        }
    };

    if (userInfo.isLogged) {
        return <Navigate to={paths.PROFILE} />;
    }
    return (
        <div className={styles.LoginContainer}>
            <Card>
                <div className={styles.ContentContainer}>
                    <div className={styles.ChildContent}>
                        <Timeline
                            items={[
                                { children: 'Open you SSI wallet app', dot: 1 },
                                { children: 'Scan this QRCode', dot: 2 },
                                { children: 'Connect using WalletConnect', dot: 3 },
                                { children: 'Verify your credential', dot: 4 }
                            ]}
                        />
                    </div>
                    <Space className={styles.ChildContent} direction="vertical">
                        <QRCode
                            status={!qrCodeURL ? 'loading' : 'active'}
                            value={qrCodeURL || '-'}
                            size={300}
                        />
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default Login;
