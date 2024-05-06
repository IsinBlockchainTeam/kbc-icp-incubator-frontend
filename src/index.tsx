import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { App } from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { Provider } from "react-redux";
import {persistor, store} from "./redux/store";
import {PersistGate} from "redux-persist/integration/react";

global.Buffer = require("buffer").Buffer;

window.Buffer = window.Buffer || require("buffer").Buffer;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
console.log(window.location.origin);
root.render(
  <React.Fragment>
    <Auth0Provider
      domain="dev-ydt6o8-n.us.auth0.com"
      clientId="qPk90tbnZvm3ecVE13omjOA05I7cOssc"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </Auth0Provider>
  </React.Fragment>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
