import {Timeline, Space, QRCode} from "antd";
import styles from "./Login.module.scss";
import {useEffect, useState} from "react";
import {paths, requestPath} from "../../constants";
import {request} from "../../utils/request";
import {v4 as uuid} from "uuid";
import {openNotification, NotificationType} from "../../utils/notification";
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
                    dispatch(updateUserInfo({
                        isLogged: true,
                        id: userInfo.id || "",
                        legalName: userInfo.legalName || "",
                        email: userInfo.email || "",
                        address: userInfo.address || "",
                        nation: userInfo.nation || "",
                        telephone: userInfo.telephone || "",
                        image: userInfo.image || "",
                        role: userInfo.role || "",
                        organizationId: userInfo.organizationId || "",
                        privateKey: userInfo.privateKey || ""
                    }));
                    navigate(paths.PROFILE);
                    openNotification(
                        "Authenticated",
                        `Login succeed. Welcome ${userInfo.legalName}!`,
                        NotificationType.SUCCESS
                    );

                } else {
                    console.log("NO MESSAGE");
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [challengeId]);


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
            {/* <button onClick={fakeLoginExp}>Fake Login Exporter</button>
            <button onClick={fakeLoginImp}>Fake Login Importer</button> */}
        </div>
    );
}
