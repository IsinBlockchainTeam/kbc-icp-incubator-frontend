# KBC Platform

This project is a [_React_](https://reactjs.org/) webapp that serves as the entry point to the KBC Coffee Trading Project's platform. It allows visualizing the operations performed on-chain

This package is written in TypeScript.

## Prerequisites

-   [Git](https://git-scm.com/)
-   [Nodejs](https://nodejs.org/en) (v.18.x recommended)
-   [Metamask](https://metamask.io/) browser extension
-   An access token for the ['Coffee Trading Management Lib'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) private npm registry
-   An access token for the ['One Lib To Rule Them All'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) private npm registry
-   ['One Lib To Rule Them All'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) IPC network up and running
-   [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) project up and running
-   [VC Manager](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/vc-manager) project up and running

## Getting Started

1. First, ensure you have configured and run the ['One Lib To Rule Them All'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) ICP network, [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) Ethereum network and the [VC Manager](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/vc-manager) projects
2. Clone this repository using command `git clone https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/kbc-platform.git`
3. Enter the newly created folder using `cd kbc-platform`
4. Change branch to `dev` using command `git checkout dev`
5. Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
6. Run `npm i` to install the required dependencies
7. Rename the `.env.local.template` file to `.env.local` and fill in the missing information
8. Run `npm run start:dev` to start the application
9. Open your browser and navigate to `http://localhost:3000` to see the _React_ webapp

## Deploy React App on ICP - Local Replica

This project is configured to be optionally deployed on an ICP network. To deploy the project on your local ICP network, follow these steps:

1. Make sure you have the IC SDK `dfx` tool installed. You can find the installation instructions [here](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
2. Make sure you have followed the project configuration as explained in section [Getting Started](#getting-started)
3. Build the project using `npm run build`
4. Run `dfx deploy` to deploy the project on the local ICP network. You should receive the URL where the project has been deployed

## Deploy React App on ICP - Mainnet

To deploy the project on the ICP mainnet, follow these steps:

1. Check you have configured your wallet correctly and have enough cycles to deploy the canisters. You can check your balance using `dfx wallet balance --network ic`
2. If you have not created the canister on the mainnet yet, run `dfx canister create --network ic kbc-platform --with-cycles <desired_cycles> <canister_name>`
3. Make sure you have followed the project configuration as explained in section [Getting Started](#getting-started)
4. Build the project using `npm run build`
5. Deploy canister using `dfx canister install --network ic --mode <mode> kbc-platform`. Mode "reinstall" is suggested

### `npmrc` Configuration

| Registry name              | Description                                                                                                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kbc-lib:registry`        | Needed for **installing** dependencies. It's an access token with read access to the [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) private npm registry |
| `@blockchain-lib:registry` | Needed for **installing** dependencies. It's an access token with read access to the [common](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) private npm registry                                                      |

### Environment Variables Configuration

| Variable                                       | Description                                                                                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_VERIFIER_BACKEND_URL`               | The URL where the `verifier_backend` project is running                                                                                                                                                  |
| `REACT_APP_EMAIL_SENDER_URL`                   | The URL where the `email_sender` project is running                                                                                                                                                      |
| `REACT_APP_RPC_URL`                            | The URL where the ethereum network is running                                                                                                                                                            |
| `REACT_APP_CHAIN_ID`                           | The id of the chain where the ethereum network is running                                                                                                                                                |
| `REACT_APP_BC_CONFIRMATION_NUMBER`             | The number of confirmations that you want to wait for 2 successive (write) transactions                                                                                                                  |
| `REACT_APP_CHAIN_NAME`                         | Optional, the name of the chain you are using                                                                                                                                                            |
| `REACT_APP_WALLET_CONNECT_PROJECT_ID`          | Your Wallet Connect's project ID. You can create one in [Wallet Connect Cloud](https://cloud.walletconnect.com/app)                                                                                      |
| `REACT_APP_CANISTER_ENV_GLOB`                  | The absolute path to the ['One Lib To Rule Them All'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) IPC network                                           |
| `DFX_NETWORK` & `REACT_APP_CANISTER_ID_<name>` | Leave this fields empty, as they will be automatically filled by the app                                                                                                                                 |
| `REACT_APP_CONTRACT_<name>`                    | The addresses of the smart contracts of the KCB Coffee Trading project. If you are using the local Hardhat network, leave these set to their default values, otherwise insert the new contract addresses |

## Local development

If you want to develop locally:

-   Make sure you have built the _One Lib To Rule Them All_ `packages/common` package
-   Inside file `package.json` change the `@blockchain-lib/common` dependency to the local path of the `packages/common` package. Use the following format: `"@blockchain-lib/common": "file:<relative-path-to-packes-common-package>"`
-   Make sure you have built the _Coffee Trading Management Lib_ `src` package
-   Inside file `package.json` change the `@kbc-lib/coffee-trading-management-lib` dependency to the local path of the `src` package. Use the following format: `"@kbc-lib/coffee-trading-management-lib": "file:<relative-path-to-src-package>"`

## Troubleshooting

When signing transactions using Metamask after restarting the local _Hardhat_ blockchain, you may encounter the following error:

```
MetaMask - RPC Error: Internal JSON-RPC error.
{code: -32603, message: "Internal JSON-RPC error."}
```

This is due to the fact that Metamask is trying to contact the local blockchain with the latest known block number, but the blockchain has been restarted and the block number has been reset.
To fix this, you can reset the block number used by Metamask following these steps:

1. Press on the Metamask extension in the top right corner of your browser
2. Press on the three dots in the top right corner of the Metamask extension
3. Press on `Settings`
4. Press on `Advanced`
5. Press on `Clear activity tab data`
