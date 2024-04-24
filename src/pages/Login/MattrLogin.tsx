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
import {
  ICPOrganizationDriver
} from "@blockchain-lib/common";

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
    subjectClaims.podName = "consortium";
    subjectClaims.podClientId = "consortium-coffe-com-token-1712064717397_44e998ab-13e8-4000-bcad-47994dc6f6ef";
    subjectClaims.podClientSecret = "626a34cad362492c2cdeaba61e5266d026458d686097eab7078bab1fff723ae535b87df68b645760918bf084f7a3a154650f781bde68fe6f21d0e3e8b96a8418";
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

  const createOrganization = async () => {
    const organizationDriver = ICPOrganizationDriver.getInstance();
    const orgId = await organizationDriver.createOrganization("Dunder Mifflin", "The best paper company in the world");
    console.log("Organization created successfully:", orgId);
    console.log("Organization:", await organizationDriver.getUserOrganizations());
  }

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
      <Button onClick={createOrganization}>Create Organization</Button>
    </div>
  );
};
