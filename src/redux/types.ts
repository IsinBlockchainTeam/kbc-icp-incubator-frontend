import {OrganizationCredential} from "../api/types/OrganizationCredential";
import {UserInfoState} from "./reducers/userInfoSlice";
import {LoadingState} from "./reducers/loadingSlice";
import {WalletConnectState} from "./reducers/walletConnectSlice";

export type RootState = {
    userInfo: UserInfoState;
    walletConnect: WalletConnectState;
    auth: {
        subjectDid: string;
        subjectClaims: OrganizationCredential | null;
    };
    loading: LoadingState;
};
