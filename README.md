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

- First, ensure you have configured and run the [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) and the [VC Manager](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/vc-manager) projects
- Clone this repository using command `git clone https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/kbc-platform.git`
- Enter the newly created folder using `cd kbc-platform`
- Change branch to `dev` using command `git checkout dev`
- Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
- Run `npm i` to install the required dependencies
- Rename the `.env.local.template` file to `.env.local` and fill in the missing information
- Run `npm run start` to start the application
- Open your browser and navigate to `http://localhost:3000` to see the _React_ webapp
- Click on the Metamask extension in the top right corner of your browser
- Import an account by clicking on the 'Account' dropdown and selecting 'Add account or hardware wallet' and then 'Import account'. Paste in the private key of the account you want to use. If you are using the local Hardhat network, you can find accounts and their private keys in the terminal where you have run command `npx hardhat node`.
- Configure the blockchain network by pressing on the button in the top right corner of the Metamask extension and select the desired network. If you are using the local Hardhat network, you can follow [this guide](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node)
- Switch the `View mode` in the top left corner to `Blockchain ON`, then press on `Settings` and `Login`. You can now connect your wallet
- You should now be able to see Trades, Materials, Transformations, Partners and Offers. If you can't see any data, try populating the blockchain with default data using `Integration tests` of either [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) or https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/blockchain-sync-layer) projects

### `npmrc` Configuration
| Registry name              | Description                                                                                                                                                                                                                                                          |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@kbc-lib:registry`        | Needed for **installing** dependencies. It's an access token with read access to the [Coffee Trading Management Lib](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib) private npm registry |
| `@blockchain-lib:registry` | Needed for **installing** dependencies. It's an access token with read access to the [common](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) private npm registry                                                      |
| `@unece:registry`          | Needed for **installing** dependencies. It's an access token with read access to the [Unece Backend](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/coffe-trading/unece-backend) private npm registry                                            |

### Environment Variables Configuration
| Variable                    | Description                                                                                                                                                                                              |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REACT_APP_LOCAL_DEV`       | Leave this set to 'local'                                                                                                                                                                                |
| `REACT_APP_CONTRACT_<name>` | The addresses of the smart contracts of the KCB Coffee Trading project. If you are using the local Hardhat network, leave these set to their default values, otherwise insert the new contract addresses |

## Local development
If you want to develop locally, follow these steps:
- Make sure you have built the _Coffee Trading Management Lib_ `src` package
- Inside file `package.json` change the `@kbc-lib/coffee-trading-management-lib` dependency to the local path of the `src` package. Use the following format: `"@kbc-lib/coffee-trading-management-lib": "file:<relative-path-to-src-package>"`