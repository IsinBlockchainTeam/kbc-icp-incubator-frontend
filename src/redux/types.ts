import { OrganizationCredential } from "../api/types/OrganizationCredential";
import {UserInfoState} from "./reducers/userInfoSlice";

export type RootState = {
    userInfo: UserInfoState;
  auth: {
    subjectDid: string;
    subjectClaims: OrganizationCredential | null;
  };
};
