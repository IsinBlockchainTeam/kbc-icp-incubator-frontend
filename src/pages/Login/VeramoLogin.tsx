import { Timeline, Space, QRCode } from 'antd';
import styles from './Login.module.scss';
import React, { useEffect, useState } from 'react';
import { request } from '@/utils/request';
import { v4 as uuid } from 'uuid';
import { openNotification, NotificationType } from '@/utils/notification';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserInfo } from '@/redux/reducers/userInfoSlice';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { requestPath } from '@/constants/url';
import { paths } from '@/constants/paths';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { LOGIN_MESSAGE } from '@/constants/message';
import { createEthereumProvider } from '@/utils/walletConnect';
import { useWalletConnect } from '@/providers/WalletConnectProvider';

export default function VeramoLogin() {
    const { provider, setProvider, setConnected } = useWalletConnect();
    const [qrCodeURL, setQrCodeURL] = useState<string>('');
    const [walletConnectURI, setWalletConnectURI] = useState<string>();
    const [verifiablePresentationURL, setVerifiablePresentationURL] = useState<string>();
    const [challengeId, setChallengeId] = useState<string>('');
    // const [initialized, setInitialized] = useState<boolean>(false);
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    useEffect(() => {
        if (!walletConnectURI || !verifiablePresentationURL) return;
        const message = JSON.stringify({
            wc_uri: walletConnectURI,
            vp_url: verifiablePresentationURL
        });
        setQrCodeURL(message);
    }, [walletConnectURI, verifiablePresentationURL]);

    // const init = async () => {
    //     const provider = await createEthereumProvider();
    //
    //     setProvider(provider);
    //     setInitialized(true);
    // };
    //
    // useEffect(() => {
    //     if (!initialized) init();
    // }, [initialized]);

    const onConnect = async () => {
        setConnected(true);
        console.log('session', provider?.session);
    };

    useEffect(() => {
        // if (!provider) return;

        provider.on('display_uri', (uri: string) => {
            console.log('display_uri', uri);
            setWalletConnectURI(uri);
        });
        provider.on('connect', (args: any) => {
            console.log('event connect');
            console.log('args', args);
            onConnect();
        });

        (async () => {
            await provider.connect();
            console.log('connected!!!');
        })();
    }, [provider]);

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
        } finally {
            dispatch(removeLoadingMessage(LOGIN_MESSAGE.COMPUTE.LOADING));
        }
    };

    useEffect(() => {
        requestAuthPresentation();
    }, []);

    useEffect(() => {
        if (challengeId) {
            const interval = setInterval(async () => {
                await fetchResponse(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [challengeId]);

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
                const userInfo = message.body.verifiableCredential[0].credentialSubject;
                dispatch(
                    updateUserInfo({
                        id: userInfo.id || '',
                        legalName: userInfo.legalName || '',
                        email: userInfo.email || '',
                        address: userInfo.address || '',
                        nation: userInfo.nation || '',
                        telephone: userInfo.telephone || '',
                        image: userInfo.image || '',
                        role: userInfo.role || '',
                        organizationId: userInfo.organizationId || '',
                        privateKey: userInfo.privateKey || ''
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
        }
    };

    // Note: use this when you don't want to bother scanning the QR code in development...
    /* const fakeLoginExp = () => {
        dispatch(updateUserInfo({
            isLogged: true,
            "legalName": "Dunder Mifflin",
            "address": "st. 5 Scranton",
            "telephone": "+1 233746 432345",
            "email": "sales@dundermifflin.com",
            "image": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Dunder_Mifflin%2C_Inc.svg",
            "nation": "USA",
            "role": "EXPORTER",
            "organizationId": "0",
            "privateKey": "47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
            "id": "did:ethr:dev:0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"
        }))
    }

    const fakeLoginImp = () => {
        dispatch(updateUserInfo({
            isLogged: true,
            "legalName": "ISIN",
            "address": "via la Santa 1",
            "telephone": "+41 79 345 3456",
            "email": "isin@supsi.ch",
            "image": "https://gioconda.supsi.ch/images/ISIN_logo.jpg",
            "nation": "Switzerland",
            "role": "IMPORTER",
            "organizationId": "1",
            "privateKey": "c526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa",
            "id": "did:ethr:dev:0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
        }))
    } */

    if (userInfo.isLogged) {
        return <Navigate to={paths.PROFILE} />;
    }
    return (
        <div className={styles.ContentContainer}>
            <div className={styles.ChildContent}>
                <Timeline
                    items={[
                        { children: 'Open you SSI wallet app', dot: 1 },
                        { children: 'Scan this QRCode', dot: 2 },
                        { children: 'Verify your credential', dot: 3 }
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
            {/* <button onClick={fakeLoginExp}>Fake Login Exporter</button>
            <button onClick={fakeLoginImp}>Fake Login Importer</button> */}
        </div>
    );
}
