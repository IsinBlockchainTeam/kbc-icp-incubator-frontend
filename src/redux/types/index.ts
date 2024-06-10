import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { LoadingState } from '@/redux/reducers/loadingSlice';
import { SiweIdentityState } from '@/redux/reducers/siweIdentitySlice';

export type RootState = {
    userInfo: UserInfoState;
    siweIdentity: SiweIdentityState;
    loading: LoadingState;
};
