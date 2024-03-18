import { Timeline, Space, QRCode } from "antd";
import styles from "./Login.module.scss";
import { useEffect, useState } from "react";
import { requestPath } from "../../constants";
import { request } from "../../utils/request";
import { v4 as uuid } from "uuid";
import { openNotification, NotificationType } from "../../utils/notification";
import { formatDid } from "../../utils/utils";
import { useDispatch } from "react-redux";
import { updateSubjectDid } from "../../redux/reducers/authSlice";

export default function VeramoLogin() {
  const [qrCodeURL, setQrCodeURL] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const dispatch = useDispatch();

  const requestAuthPresentation = async () => {
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
  };

  useEffect(() => {
    requestAuthPresentation();
  }, []);

  useEffect(() => {
    if (challengeId) {
      const interval = setInterval(async () => {
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
