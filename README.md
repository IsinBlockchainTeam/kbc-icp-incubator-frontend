# KBC Platform

This project is a [_React_](https://reactjs.org/) webapp that serves as the entry point to the KBC Coffee Trading Project's platform. It allows visualizing the operations performed on-chain

This package is written in TypeScript.

## Prerequisites

-   [Git](https://git-scm.com/)
-   [Nodejs](https://nodejs.org/en) (v.18.x recommended)
-   [kbc-icp-incubator-common](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-common) project
-   IPC network up and running with the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) canisters deployed
-   [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) project
-   A pair of Verifiable Credentials useful to authenticate the user inside the platform. Please feel free to contact us if you want a pair of credentials to test the platform

## Getting Started

1. First, ensure you have configured and run the ICP network with the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) canisters deployed, Ethereum network with the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) smart contracts deployed
2. Clone this repository using command `git clone https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend.git`
3. Enter the newly created folder using `cd kbc-platform`
4. Rename the `.npmrc.template` file to `.npmrc`
5. Run `npm i` to install the required dependencies
6. Rename the `.env.local.template` file to `.env.local` and fill in the missing information
7. Run `npm run start` to start the application
8. Open your browser and navigate to `http://localhost:3000` to see the _React_ webapp

## Deploy React App on ICP - Local Replica

This project is configured to be optionally deployed on an ICP network. To deploy the project on your local ICP network, follow these steps:

1. Make sure you have the IC SDK `dfx` tool installed. You can find the installation instructions [here](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
2. Make sure you have followed the project configuration as explained in section [Getting Started](#getting-started)
3. Build the project using `npm run build:icp`
4. Run `dfx deploy` to deploy the project on the local ICP network. You should receive the URL where the project has been deployed

## Deploy React App on ICP - Mainnet

To deploy the project on the ICP mainnet, follow these steps:

1. Check you have configured your wallet correctly and have enough cycles to deploy the canisters. You can check your balance using `dfx wallet balance --network ic`
2. If you have not created the canister on the mainnet yet, run `dfx canister create --network ic kbc-platform --with-cycles <desired_cycles> <canister_name>`
3. Make sure you have followed the project configuration as explained in section [Getting Started](#getting-started)
4. Build the project using `npm run build:icp`
5. Deploy canister using `dfx canister install --network ic --mode <mode> kbc-platform`. Mode "reinstall" is suggested

### `npmrc` Configuration

| Registry name              | Description                                                                                                                                                                        |
| -------------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@kbc-lib:registry`        | Needed for **installing** dependencies. It's the place where you can find the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) library |
| `@blockchain-lib:registry` | Needed for **installing** dependencies. It's the place where you can find the [kbc-icp-incubator-common](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-common) library   |

### Environment Variables Configuration

| Variable                                       | Description                                                                                                                                                                                              |
| ---------------------------------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REACT_APP_CANISTER_ENV_GLOB` | The absolute path to the dfx generated .env file that contains the canister ids. This file is generated when you run `dfx deploy` command                                                                |
| `DFX_NETWORK` & `REACT_APP_CANISTER_ID_<name>` | Leave this fields untouched, as they will be automatically filled by the app                                                                                                                             |
| `REACT_APP_WALLET_CONNECT_PROJECT_ID`          | Your Wallet Connect's project ID. You can create one in [Wallet Connect Cloud](https://cloud.walletconnect.com/app)                                                                                      |
| `REACT_APP_VERIFIER_BACKEND_URL`               | The URL where the `verifier_backend` project is running                                                                                                                                                  |
| `REACT_APP_EMAIL_SENDER_URL`                   | The URL where the `email_sender` project is running                                                                                                                                                      |
| `REACT_APP_BC_CONFIRMATION_NUMBER`             | The number of confirmations that you want to wait for 2 successive (write) transactions                                                                                                                  |
| `REACT_APP_CONTRACT_<name>`                    | The addresses of the smart contracts of the KCB Coffee Trading project. If you are using the local Hardhat network, leave these set to their default values, otherwise insert the new contract addresses |

## Local development

If you want to develop locally:

-   Make sure you have built the [kbc-icp-incubator-common](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-common) `package/` package
-   Inside file `package.json` change the `@blockchain-lib/common` dependency to the local path of the `package/` package. Use the following format: `"@blockchain-lib/common": "file:<relative-path-to-packes-package>"`
-   Make sure you have built the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) `src` package
-   Inside file `package.json` change the `@kbc-lib/coffee-trading-management-lib` dependency to the local path of the `src` package. Use the following format: `"@kbc-lib/coffee-trading-management-lib": "file:<relative-path-to-src-package>"`
