import { Timeline, Space, QRCode } from "antd";
import styles from "./Login.module.scss";
import { useEffect, useState } from "react";
import {paths, requestPath} from "../../constants";
import { request } from "../../utils/request";
import { v4 as uuid } from "uuid";
import { openNotification, NotificationType } from "../../utils/notification";
import {useDispatch, useSelector} from "react-redux";
import { updateSubjectDid } from "../../redux/reducers/authSlice";
import { updateUserInfo } from "../../redux/reducers/userInfoSlice";
import {RootState} from "../../redux/store";
import {Navigate, useNavigate} from "react-router-dom";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useSiweIdentity} from "../../components/icp/SiweIdentityProvider/SiweIdentityProvider";
import SingletonSigner from "../../api/SingletonSigner";

export default function VeramoLogin() {
  const [qrCodeURL, setQrCodeURL] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const dispatch = useDispatch();
  const { login } = useSiweIdentity();
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
        await fetchResponse(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [challengeId]);

  const fetchResponse = async (interval: any) => {
    try {
      const message = await request(
          `${requestPath.VERIFIER_BACKEND_URL}/presentations/callback/validated?challengeId=${challengeId}`,
          { method: "GET" }
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
        if(!userInfo.privateKey)
          throw new Error("No private key found");
        SingletonSigner.setInstance(userInfo.privateKey);
        await login();
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
    } catch(error: any) {
        console.log("error: ", error);
        openNotification("Error", "Error while logging in", NotificationType.ERROR);
    }
  }

  if(userInfo.isLogged) {
    return <Navigate to={paths.PROFILE} />;
  }
  return (
    <div className={styles.ContentContainer}>
      <div className={styles.ChildContent}>
        <Timeline
          items={[
            { children: "Open you SSI wallet app", dot: 1 },
            { children: "Scan this QRCode", dot: 2 },
            { children: "Verify your credential", dot: 3 },
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
    </div>
  );
}
