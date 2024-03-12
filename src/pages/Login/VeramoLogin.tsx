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
    // const id = uuid();
    // const verifier = await veramoService.importIdentifier(
    //   "did:ethr:goerli:0x5a49c60f856d9B411224C58e69A4d1B248Bdd46c",
    //   "69407cab440be08432f333c43e48fd5c3b1837618ee1b51181af5f09e0eef2ac",
    //   "verifier"
    // );
    // await veramoService.addX25519DidKey(verifier.did);
    // await veramoService.addDidCommServiceaddService(verifier.did);
    // const jwt = await veramoService.createSelectiveDisclosureRequest(
    //   verifier.did,
    //   id,
    //   "",
    //   "Please, authenticate yourself"
    // );
    // const data = await veramoService.generateQRcodeForPresentationRequest(
    //   "presentation-request-auth",
    //   verifier.did,
    //   id,
    //   jwt
    // );
    // setRequestId(id);
    // setQrCodeURL(data.qrcode);

    const response = await request(
      `${requestPath.VERIFIER_BACKEND_URL}/presentations/create/selective-disclosure`,
      {
        method: "POST",
        body: JSON.stringify({
          tag: uuid(),
          claimType: "",
          reason: "Please, authenticate yourself",
        }),
      }
    );
    console.log("RESPONSE", response);
    setQrCodeURL(response.qrcode);
    setChallengeId(response.offer.id);
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
