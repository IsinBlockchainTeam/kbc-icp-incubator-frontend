import React, { useEffect } from "react";
import { Worker } from "@react-pdf-viewer/core";
import Routes from "./routes/routes";

export const App = () => {

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
      <Routes />
    </Worker>
  );
};

export default App;
