import {UserInfoState} from "../reducers/userInfoSlice";
import {LoadingState} from "../reducers/loadingSlice";
import {SiweIdentityState} from "../reducers/siweIdentitySlice";

export type RootState = {
    userInfo: UserInfoState;
    siweIdentity: SiweIdentityState;
    loading: LoadingState;
};
