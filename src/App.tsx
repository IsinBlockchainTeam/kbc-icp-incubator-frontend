import React from "react";
import { Worker } from "@react-pdf-viewer/core";
import Routes from "./routes/routes";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

// 1. Get projectId
const projectId = 'e55dee800a9c2117a91613b30aa697ee'

// 2. Set chains
const chain = {
    chainId: 11155111,
    name: 'Sepolia Infura',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: "https://sepolia.infura.io/v3/14bc392775034b3d80988f5211a95985",
}

// 3. Create a metadata object
const metadata = {
    name: 'KBC platform',
    description: 'A portal to decentralized coffee trading',
    url: 'http://192.168.0.173:3000',
    icons: ['https://upload.wikimedia.org/wikipedia/commons/9/9c/Dunder_Mifflin%2C_Inc.svg']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
})

// 5. Create a Web3Modal instance
createWeb3Modal({
    ethersConfig,
    chains: [chain],
    projectId,
});


export const App = () => {

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
      <Routes />
    </Worker>
  );
};

export default App;
