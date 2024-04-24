import { OrganizationCredential } from "../api/types/OrganizationCredential";
import { ICPIdentityDriver } from "@blockchain-lib/common";

export type RootState = {
  auth: {
    subjectDid: string;
    subjectClaims: OrganizationCredential | null;
    icpIdentityDriver: ICPIdentityDriver | null;
  };
};
