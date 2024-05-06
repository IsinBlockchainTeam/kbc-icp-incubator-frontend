import {Timeline, Space, QRCode, Button} from "antd";
import styles from "./Login.module.scss";
import {useEffect, useState} from "react";
import {paths, requestPath} from "../../constants";
import {request} from "../../utils/request";
import {v4 as uuid} from "uuid";
import {openNotification, NotificationType} from "../../utils/notification";
import {formatDid} from "../../utils/utils";
import {useDispatch, useSelector} from "react-redux";
import {updateSubjectDid} from "../../redux/reducers/authSlice";
import {updateUserInfo} from "../../redux/reducers/userInfoSlice";
import {RootState} from "../../redux/store";
import {Navigate, useNavigate} from "react-router-dom";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";

export default function VeramoLogin() {
    const [qrCodeURL, setQrCodeURL] = useState<string>("");
    const [challengeId, setChallengeId] = useState<string>("");
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();

    const requestAuthPresentation = async () => {
        try {
            dispatch(showLoading("Loading..."))
            const id = uuid();
            const response = await request(
                `${requestPath.VERIFIER_BACKEND_URL}/presentations/create/selective-disclosure`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        tag: id,
                        claimType: "legalName",
                        reason: "Please, authenticate yourself",
                    }),
                }
            );
            setQrCodeURL(response.qrcode);
            setChallengeId(id);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    };

    useEffect(() => {
        requestAuthPresentation();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    useEffect(() => {
        if (challengeId) {
            const interval = setInterval(async () => {
                const message = await request(
                    `${requestPath.VERIFIER_BACKEND_URL}/presentations/callback/validated?challengeId=${challengeId}`,
                    {method: "GET"}
                );
                if (message) {
                    console.log("MESSAGE", message);

                    clearInterval(interval);
                    setChallengeId("");
                    const subjectDid = message.body.holder;
                    if (!subjectDid) {
                        openNotification(
                            "Error",
                            "No subject DID found",
                            NotificationType.ERROR
                        );
                        return;
                    }
                    dispatch(updateSubjectDid(subjectDid));
                    const userInfo = message.body.verifiableCredential[0].credentialSubject;
                    dispatch(updateUserInfo({isLogged: true, ...userInfo}));
                    navigate(paths.PROFILE);
                    openNotification(
                        "Authenticated",
                        `User with DID ${formatDid(message.body.holder)} has authenticated succesfully`,
                        NotificationType.SUCCESS
                    );

                } else {
                    console.log("NO MESSAGE");
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [challengeId]);

    const fakeLogin = () => {
        dispatch(updateSubjectDid("did:ethr:dev:0x90F79bf6EB2c4f870365E785982E1f101E93b906"));
        const userInfo = {
            address: "via la Santa 1",
            email: "isin@supsi.ch",
            id: "did:ethr:dev:0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            image: "https://gioconda.supsi.ch/images/ISIN_logo.jpg",
            industrialSector: "IT",
            latitude: "46.012120",
            legalName: "ISIN",
            longitude: "8.960886",
            nation: "Switzerland",
            privateKey: "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
            subjectDid: "did:ethr:dev:0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            telephone: "+41 79 345 3456"
        }
        dispatch(updateUserInfo({isLogged: true, ...userInfo}));
    }

    if (userInfo.isLogged) {
        return <Navigate to={paths.PROFILE}/>;
    }
    return (
        <div className={styles.ContentContainer}>
            <div className={styles.ChildContent}>
                <Timeline
                    items={[
                        {children: "Open you SSI wallet app", dot: 1},
                        {children: "Scan this QRCode", dot: 2},
                        {children: "Verify your credential", dot: 3},
                    ]}
                />
            </div>
            <Space className={styles.ChildContent} direction="vertical">
                <QRCode
                    status={!qrCodeURL ? "loading" : "active"}
                    value={qrCodeURL || "-"}
                    size={300}
                />
            </Space>
            <Button danger onClick={fakeLogin}>Fake Login</Button>
        </div>
    );
}
