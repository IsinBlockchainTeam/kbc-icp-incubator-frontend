<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend">
    <img src="https://static.wixstatic.com/media/1a060c_163f7da40976483c956987af0c85a035~mv2.png" alt="Logo" width="260">
  </a>
  <h3 align="center">KBC Platform</h3>

  <p align="center">
   A React-based web application serving as the entry point to the KBC Coffee Trading Project's platform, enabling visualization of on-chain operations.    
   <br />
    <a href="##getting-started">Quick Start</a>
    ·
    <a href="https://gitlab-core.supsi.ch/issues">Report Bug</a>
    ·
    <a href="https://gitlab-core.supsi.ch/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation-and-configuration">Installation and configuration</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#development">Development</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project
KBC Platform is a TypeScript-based React web application that provides a user interface for the KBC Coffee Trading Project. It enables users to visualize and interact with operations performed on the blockchain.

<table>
   <tr>
     <td align="center">
       <p>
         <strong>🔐 Want to access the platform? 🔐</strong><br>
         Contact us to obtain your Verifiable Credential and start trading!<br>
         <a href="mailto:isinblockchainteam@outlook.com">isinblockchainteam@outlook.com</a>
       </p>
     </td>
   </tr>
 </table>

### Built With

* [![Typescript][Typescript-shield]][Typescript-url]
* [![ICP][ICP-shield]][ICP-url]
* [![Node.js][Node.js-shield]][Node.js-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Nodejs](https://nodejs.org/en) (v.20.x recommended)
- [DFX](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html) (v.0.23.0 recommended)
- IPC network with [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) canisters deployed
- Verifiable Credentials for platform authentication

### Installation and configuration

1. Configure [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) canisters and smart contracts
2. Clone the repository
   ```sh
   git clone https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend.git
   ```
3. Enter the project directory
   ```sh
   cd kbc-icp-incubator-frontend
   ```
4. Configure npmrc
   ```sh
   cp .npmrc.template .npmrc
   ```   
5. Install dependencies
   ```sh
   npm install
   ```   
6. Set up environment
   ```sh
   cp .env.local.template .env.local
   ```   
7. Start the application
   ```sh
   npm run start
   ```   

### `npmrc` Configuration

| Registry name              | Description                                                                                                                                                                        |
| -------------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@isinblockchainteam:registry`        | Needed for **installing** dependencies. It's the place where you can find the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) library |

### Environment Variables Configuration

| Variable                                       | Description                                                                                                                                                                                              |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REACT_APP_CANISTER_ENV_GLOB`                  | The absolute path to the dfx generated .env file that contains the canister ids. This file is generated when you run `dfx deploy` command                                                                |
| `DFX_NETWORK` & `REACT_APP_CANISTER_ID_<name>` | Leave this fields untouched, as they will be automatically filled by the app                                                                                                                             |
| `REACT_APP_WALLET_CONNECT_PROJECT_ID`          | Your Wallet Connect's project ID. You can create one in [Wallet Connect Cloud](https://cloud.walletconnect.com/app)                                                                                      |
| `REACT_APP_VERIFIER_BACKEND_URL`               | The URL where the `verifier_backend` project is running                                                                                                                                                  |
| `REACT_APP_RPC_URL`                            | RPC endpoint URL for blockchain interaction                                                                                                                                                              |
| `REACT_APP_CHAIN_ID`                           | Blockchain network chain ID                                                                                                                                                                              |
| `REACT_APP_BC_CONFIRMATION_NUMBER`             | The number of confirmations that you want to wait for 2 successive (write) transactions                                                                                                                  |
| `REACT_APP_CONTRACT_<name>`                    | The addresses of the smart contracts of the KCB Coffee Trading project. If you are using the local Hardhat network, leave these set to their default values, otherwise insert the new contract addresses |
| `REACT_APP_TOKEN`                              | Token contract address                                                                                                                                                                                   |
| `REACT_APP_DOWN_PAYMENT_FEE_PERCENT`           | Fee percentage for down payments (e.g., 0.0)                                                                                                                                                             |
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── components/                # Reusable UI components
│   ├── AsyncComponent/       # Async loading wrapper
│   ├── CardContents/        # Card content components
│   ├── CertificationsInfo/  # Certification related components
│   ├── DownPaymentPanel/    # Payment panel components
│   ├── EscrowPanel/         # Escrow management components
│   └── ShipmentPanel/       # Shipment tracking components
├── constants/                # Application constants
├── hooks/                    # Custom React hooks
├── layout/                   # Layout components
│   ├── BasicLayout/
│   ├── ContentLayout/
│   └── MenuLayout/
├── pages/                    # Page components
│   ├── AssetOperation/
│   ├── Certification/
│   ├── Login/
│   ├── Material/
│   └── Trade/
├── providers/                # Context providers
│   ├── auth/                # Authentication providers
│   ├── entities/            # Data providers
│   └── storage/             # Storage providers
├── redux/                    # Redux state management
├── routes/                   # Route definitions
│   ├── private/
│   └── public/
├── utils/                    # Utility functions
└── templates/                # Document templates
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Development

### Starting Local Environment

If you want to develop locally:

-   Make sure you have built the [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library) `src` package
-   Inside file `package.json` change the `@kbc-lib/coffee-trading-management-lib` dependency to the local path of the `src` package. Use the following format: `"@kbc-lib/coffee-trading-management-lib": "file:<relative-path-to-src-package>"`
- Start local environment
   ```sh
   npm run start
   ```

### Deploying
#### Local Replica

This project is configured to be optionally deployed on an ICP network. To deploy the project on your local ICP network, follow these steps:

1. Make sure you have the IC SDK `dfx` tool installed. You can find the installation instructions [here](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
2. Make sure you have followed the project configuration as explained in section [Installation and configuration](#installation-and-configuration)
3. Build the project
   ```sh
     npm run build:icp
   ```
4. Deploy the project on the local ICP network. You should receive the URL where the project has been deployed
   ```sh
     npm dfx deploy
   ```

#### Mainnet

To deploy the project on the ICP mainnet, follow these steps:

1. Check you have configured your wallet correctly and have enough cycles to deploy the canisters.
   ```sh
     dfx wallet balance --network ic
   ```
2. If you have not created the canister on the mainnet yet
   ```sh
      dfx canister create --network ic kbc-platform --with-cycles <desired_cycles> <canister_name>
   ```
3. Make sure you have followed the project configuration as explained in section [Installation and configuration](#installation-and-configuration)
4. Build the project
   ```sh
     npm run build:icp
   ```
5. Deploy canister on mainnet. Mode "reinstall" is suggested if you need to update env variables otherwise no.
> Note: Reinstall mode clear your stable memory
   ```sh
     dfx canister install --network ic --mode <mode> kbc-platform
   ```

## Testing

```sh
# Run all tests
npm test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Submit a merge request to `main`

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

* [Tommaso Agnola](https://www.linkedin.com/in/tommaso-agnola-882146261/) - tommaso.agnola@supsi.ch
* [Mattia Dell'Oca](https://www.linkedin.com/in/mattia-dell-oca-824782214/) - mattia.delloca@supsi.ch
* [Luca Giussani](https://www.linkedin.com/in/luca-giussani-073396115/) - luca.giussani@supsi.ch
* [Lorenzo Ronzani](https://www.linkedin.com/in/lorenzo-ronzani-658311186/) - lorenzo.ronzani@supsi.ch

Project
Link: [kbc-icp-incubator-frontend](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend)

Organization Link: [IsinBlockchainTeam](https://github.com/IsinBlockchainTeam)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/IsinBlockchainTeam/kbc-icp-incubator-frontend.svg?style=github
[contributors-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/IsinBlockchainTeam/kbc-icp-incubator-frontend.svg?style=github
[forks-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend/network/members
[stars-shield]: https://img.shields.io/github/stars/IsinBlockchainTeam/kbc-icp-incubator-frontend.svg?style=github
[stars-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend/stargazers
[issues-shield]: https://img.shields.io/github/issues/IsinBlockchainTeam/kbc-icp-incubator-frontend.svg?style=github
[issues-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend/issues
[license-shield]: https://img.shields.io/github/license/IsinBlockchainTeam/kbc-icp-incubator-frontend.svg?style=github
[license-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-frontend/blob/main/LICENSE.txt
[Typescript-shield]: https://img.shields.io/badge/TypeScript-%23363636.svg?style=github&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[ICP-shield]: https://img.shields.io/badge/ICP-000000?style=github&logo=dfinity&logoColor=white
[ICP-url]: https://internetcomputer.org/
[Node.js-shield]: https://img.shields.io/badge/node.js-6DA55F?style=github&logo=node.js&logoColor=white
[Node.js-url]: https://nodejs.org/
