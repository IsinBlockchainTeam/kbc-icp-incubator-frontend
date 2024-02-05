import React, { useEffect } from "react";
import { Worker } from "@react-pdf-viewer/core";
import Routes from "./routes/routes";
import {
  getMattrAPIToken, getUneceAPIToken, isBlockchainViewMode,
  setMattrAPIToken, setUneceAPIToken,
} from "./utils/storage";
import InfoControllerApi from "./api/controllers/unece/InfoControllerApi";
import { mattrAuthenticationController } from "./api";

export const App = () => {
  const authenticationAPI = async () => {
    if (!getMattrAPIToken()) {
      const resp = await mattrAuthenticationController.login();
      if (resp.access_token) setMattrAPIToken(resp.access_token);
    }

    if (!getUneceAPIToken() && !isBlockchainViewMode()) {
      const username = "evandro", password = "user";
      const resp = await InfoControllerApi.login({ username, password });
      if (resp.token) setUneceAPIToken(resp.token);
    }
  };

  useEffect(() => {
    authenticationAPI();
  }, []);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
      <Routes />
    </Worker>
  );
};

export default App;
