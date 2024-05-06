import { OrganizationCredential } from "../api/types/OrganizationCredential";
import {UserInfoState} from "./reducers/userInfoSlice";
import {LoadingState} from "./reducers/loadingSlice";
import { ICPIdentityDriver } from "@blockchain-lib/common";

export type RootState = {
    userInfo: UserInfoState;
  auth: {
    subjectDid: string;
    subjectClaims: OrganizationCredential | null;
    icpIdentityDriver: ICPIdentityDriver | null;
  };
  loading: LoadingState;
};
