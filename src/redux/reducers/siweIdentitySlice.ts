import {createSlice} from "@reduxjs/toolkit";
import {DelegationChain, DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity";
import type {SiweIdentityStorage} from "../../components/icp/SiweIdentityProvider/storage.type";

export type SiweIdentityState = {
    isLogged: boolean,
    address: string,
    sessionIdentity: string,
    delegationChain: string,
}

const initialState: SiweIdentityState = {
    isLogged: false,
    address: "",
    sessionIdentity: "",
    delegationChain: ""
}

const siweIdentitySlice = createSlice({
    name: "siweIdentity",
    initialState,
    reducers: {
        updateSiweIdentity: (state: SiweIdentityState, action: {payload: {
                address: string,
                sessionIdentity: string,
                delegationChain: string
            }, type: string}) => {
            state.isLogged = true;
            state.address = action.payload.address;
            state.sessionIdentity = action.payload.sessionIdentity;
            state.delegationChain = action.payload.delegationChain;
        },
        clearSiweIdentity: (state: SiweIdentityState) => {
            state.isLogged = false;
            state.address = "";
            state.sessionIdentity = "";
            state.delegationChain = "";
        },
    },
});

export const selectSiweIdentity = (state: {siweIdentity: SiweIdentityState}) => {
    const s = state.siweIdentity;
    if(!s.isLogged) return null;

    if (!s.address || !s.sessionIdentity || !s.delegationChain) {
        console.error("Stored state is invalid.");
        return null;
    }

    const d = DelegationChain.fromJSON(s.delegationChain);
    const i = DelegationIdentity.fromDelegation(
        Ed25519KeyIdentity.fromJSON(s.sessionIdentity),
        d
    );

    return {address: s.address, sessionIdentity: i, delegationChain: d} as const;
};

export const { updateSiweIdentity, clearSiweIdentity } = siweIdentitySlice.actions;
export default siweIdentitySlice.reducer;
