import React from "react";
import {Worker} from "@react-pdf-viewer/core";
import Routes from "./routes/routes";
import {ICPContextProvider} from "./contexts/ICPProvider";

export const App = () => {

    return (
        <ICPContextProvider>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
                <Routes/>
            </Worker>
        </ICPContextProvider>
    );
};

export default App;
