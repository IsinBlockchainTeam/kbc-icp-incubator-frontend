import { OrganizationCredential } from "./OrganizationCredential";
import {UserInfoState} from "../reducers/userInfoSlice";
import {LoadingState} from "../reducers/loadingSlice";

export type RootState = {
    userInfo: UserInfoState;
  auth: {
    subjectDid: string;
    subjectClaims: OrganizationCredential | null;
  };
  loading: LoadingState;
};
