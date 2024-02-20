import styles from "./Login.module.scss";
import {Button, QRCode, Space, Timeline} from "antd";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { request } from "../../utils/request";
import { requestPath } from "../../constants";
import {
  mattrDidController,
  mattrMessageController,
  mattrPresentationController,
} from "../../api";
import { NotificationType, openNotification } from "../../utils/notification";
import { formatClaims, formatDid } from "../../utils/utils";
import { useDispatch } from "react-redux";
import {
  updateSubjectClaims,
  updateSubjectDid,
} from "../../redux/reducers/authSlice";
import { OrganizationCredential } from "../../api/types/OrganizationCredential";

export const MattrLogin = () => {
  const [qrCodeURL, setQrCodeURL] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  //const { updateSubjectDid, updateSubjectClaims } = useContext(GlobalContext);
  const dispatch = useDispatch();

  const handleUpdateSubjectDid = (subjectDid: string) => {
    dispatch(updateSubjectDid(subjectDid));
  };

  const handleUpdateSubjectClaims = (subjectClaims: OrganizationCredential) => {
    subjectClaims.podServerUrl = "https://localhost/";
    subjectClaims.podClientId = "consortium-coffe-com-token-1708433819496_c556915c-f737-4a62-a3be-6aad7b7c8e02";
    subjectClaims.podClientSecret = "3c410b50230b886b607d558f937788e948dd94be6cb4fe9ba52bcbadf4e5aee9e718daada00b0e7591a9c53efaaf516a92afed69d0ba515f5e888ab8bafbb8a3";
    console.log("fake login: ", subjectClaims);
    dispatch(updateSubjectClaims(subjectClaims));
  };

  const generateShortURL = async (uuid: string, signedRequest: string) => {
    const shortUrl = await request(
      `${requestPath.MATTR_PROXY_BASE_URL}/presentation/qrcode`,
      {
        method: "POST",
        body: JSON.stringify({
          uuid: uuid,
          requestValue: signedRequest,
        }),
      },
    );

    return `didcomm://${shortUrl}`;
  };

  const loadData = async () => {
    const credentialTemplate = await mattrPresentationController.getTemplate();
    const challenge_id = uuidv4();
    const credentialRequest = await mattrPresentationController.createRequest(
      challenge_id,
      credentialTemplate.id,
    );
    const did = await mattrDidController.getDidDocument(
      process.env.REACT_APP_VERIFIER_DID as string,
    );
    const signedMessage = await mattrMessageController.sign(
      did.localMetadata.initialDidDocument.authentication[0],
      credentialRequest.request,
    );
    const url = await generateShortURL(uuidv4(), signedMessage);
    setChallengeId(challenge_id);
    setQrCodeURL(url);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!challengeId) return;

    let intervalId: NodeJS.Timer;
    intervalId = setInterval(async () => {
      const result = await request(
        `${requestPath.MATTR_PROXY_BASE_URL}/presentation/callback?challengeId=${challengeId}`,
        { method: "GET" },
      );

      if (result.subjectDid) {
        openNotification(
          "Login completed",
          `Welcome ${formatDid(result.subjectDid)}!`,
          NotificationType.SUCCESS,
        );
        handleUpdateSubjectDid(result.subjectDid);
        handleUpdateSubjectClaims(formatClaims(result.claims));
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [challengeId]);

  return (
    <div className={styles.ContentContainer}>
      <div className={styles.ChildContent}>
        <Timeline
          items={[
            { children: "Open you MATTR mobile application", dot: 1 },
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
      {/* TODO: to remove and also hard coded data  */}
      <Button onClick={() => handleUpdateSubjectClaims({})}>Fake Login</Button>
    </div>
  );
};
