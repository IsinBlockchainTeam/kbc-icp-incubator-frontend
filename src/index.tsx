import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import {App} from "./App";
import {Provider} from "react-redux";
import {persistor, store} from "./redux/store";
import {PersistGate} from "redux-persist/integration/react";
import {SiweIdentityProvider} from "./components/icp/SiweIdentityProvider/SiweIdentityProvider";
import {canisterId, idlFactory} from "./components/icp/declarations/ic_siwe_provider";
import {_SERVICE} from "./components/icp/declarations/ic_siwe_provider/ic_siwe_provider.did";
import {ICPDriversProvider} from "./providers/ICPDriversProvider";
import {SignerProvider} from "./providers/SignerProvider";
import {HashRouter} from "react-router-dom";
import {EthServicesProvider} from "./providers/EthServicesProvider";

global.Buffer = require("buffer").Buffer;

window.Buffer = window.Buffer || require("buffer").Buffer;

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
root.render(
    <React.Fragment>
        <HashRouter>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <SignerProvider>
                        <SiweIdentityProvider<_SERVICE>
                            canisterId={canisterId}
                            idlFactory={idlFactory}
                        >
                            <ICPDriversProvider>
                                <EthServicesProvider>
                                    <App/>
                                </EthServicesProvider>
                            </ICPDriversProvider>
                        </SiweIdentityProvider>
                    </SignerProvider>
                </PersistGate>
            </Provider>
        </HashRouter>
    </React.Fragment>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
