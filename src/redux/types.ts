import { OrganizationCredential } from "../api/types/OrganizationCredential";

export type RootState = {
  auth: {
    subjectDid: string;
    subjectClaims: OrganizationCredential | null;
  };
};
