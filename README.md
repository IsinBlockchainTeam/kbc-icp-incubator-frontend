# KBC Platform

This project is a [_React_](https://reactjs.org/) webapp that serves as the entry point to the KBC Coffee Trading Project's platform. It allows visualizing the operations performed on-chain

This package is written in TypeScript.

## Prerequisites

- [Git](https://git-scm.com/)
- [Nodejs](https://nodejs.org/en) (v.18.x recommended)
- [Metamask](https://metamask.io/) browser extension
- An access token for the ['Coffee Trading Management Lib'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) private npm registry
- An access token for the ['common'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) private npm registry
- An access token for the ['Unece Backend'](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/unece-backend) private npm registry
- [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) project up and running
- [VC Manager](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/vc-manager) project up and running

## Getting Started

1. First, ensure you have configured and run the [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) and the [VC Manager](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/vc-manager) projects
2. Clone this repository using command `git clone https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/kbc-platform.git`
3. Enter the newly created folder using `cd kbc-platform`
4. Change branch to `dev` using command `git checkout dev`
5. Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
6. Run `npm i` to install the required dependencies
7. Rename the `.env.local.template` file to `.env.local` and fill in the missing information
8. Run `npm run start` to start the application
9. Open your browser and navigate to `http://localhost:3000` to see the _React_ webapp
10. Click on the Metamask extension in the top right corner of your browser
11. Import an account by clicking on the 'Account' dropdown and selecting 'Add account or hardware wallet' and then 'Import account'. Paste in the private key of the account you want to use. If you are using the local Hardhat network, you can find accounts and their private keys in the terminal where you have run command `npx hardhat node`.
12. Configure the blockchain network by pressing on the button in the top right corner of the Metamask extension and select the desired network. If you are using the local Hardhat network, you can follow [this guide](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node)
13. Switch the `View mode` in the top left corner to `Blockchain ON`, then press on `Settings` and `Login`. You can now connect your wallet
14. You should now be able to see Trades, Materials, Transformations, Partners and Offers. If you can't see any data, try populating the blockchain with default data using `Integration tests` of either [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) or https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/blockchain-sync-layer) projects

## Deploy React App on ICP
This project is configured to be optionally deployed on an ICP network. To deploy the project on your local ICP network, follow these steps:
1. Make sure you have the IC SDK `dfx` tool installed. You can find the installation instructions [here](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
2. Make sure you have followed the project configuration as explained in section [Getting Started](#getting-started)
3. If you don't have a local ICP replica running locally, create one by running `dfx start --clean`
4. Build the project using `npm run build`
5. Run `dfx deploy` to deploy the project on the local ICP network. You should receive the URL where the project has been deployed

### `npmrc` Configuration
| Registry name              | Description                                                                                                                                                                                                                                                          |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@kbc-lib:registry`        | Needed for **installing** dependencies. It's an access token with read access to the [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) private npm registry |
| `@blockchain-lib:registry` | Needed for **installing** dependencies. It's an access token with read access to the [common](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) private npm registry                                                      |
| `@unece:registry`          | Needed for **installing** dependencies. It's an access token with read access to the [Unece Backend](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/unece-backend) private npm registry                                            |

### Environment Variables Configuration
| Variable                         | Description                                                                                                                                                                                              |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REACT_APP_LOCAL_DEV`            | Leave this set to 'local'                                                                                                                                                                                |
| `REACT_APP_UNECE_BACKEND_URL`    | The URL where the `unece_backend` project is running                                                                                                                                                     |
| `REACT_APP_VERIFIER_BACKEND_URL` | The URL where the `verifier_backend` project is running                                                                                                                                                  |
| `REACT_APP_CONTRACT_<name>`      | The addresses of the smart contracts of the KCB Coffee Trading project. If you are using the local Hardhat network, leave these set to their default values, otherwise insert the new contract addresses |

## Local development
If you want to develop locally, follow these steps:
- Make sure you have built the _Coffee Trading Management Lib_ `src` package
- Inside file `package.json` change the `@kbc-lib/coffee-trading-management-lib` dependency to the local path of the `src` package. Use the following format: `"@kbc-lib/coffee-trading-management-lib": "file:<relative-path-to-src-package>"`

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
