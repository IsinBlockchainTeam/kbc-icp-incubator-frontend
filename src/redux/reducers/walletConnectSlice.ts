import {ethers} from "ethers";
import {createSlice} from "@reduxjs/toolkit";

export type WalletConnectState = {
    address: string | undefined;
    chainId: number | undefined;
    isConnected: boolean | undefined;
    walletProvider: ethers.providers.Web3Provider | undefined;
}

const initialState: WalletConnectState = {
    address: "",
    chainId: undefined,
    isConnected: false,
    walletProvider: undefined,
}

const walletConnectSlice = createSlice({
    name: "walletConnect",
    initialState,
    reducers: {
        updateWalletConnect: (state: WalletConnectState, action: {payload: WalletConnectState, type: string}) => {
            state.address = action.payload.address;
            state.chainId = action.payload.chainId;
            state.isConnected = action.payload.isConnected;
            state.walletProvider = action.payload.walletProvider;
        },
    },
});

export const { updateWalletConnect } = walletConnectSlice.actions;

export default walletConnectSlice.reducer;
