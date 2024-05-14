import { OrganizationCredential } from "./OrganizationCredential";
import {UserInfoState} from "../reducers/userInfoSlice";
import {LoadingState} from "../reducers/loadingSlice";
import {SiweIdentityState} from "../reducers/siweIdentitySlice";

export type RootState = {
    userInfo: UserInfoState;
    auth: {
        subjectDid: string;
        subjectClaims: OrganizationCredential | null;
    };
    siweIdentity: SiweIdentityState;
    loading: LoadingState;
};
