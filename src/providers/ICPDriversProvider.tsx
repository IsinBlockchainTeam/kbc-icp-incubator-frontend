import {createContext, type ReactNode, useEffect, useState} from "react";
import {useSiweIdentity} from "../components/icp/SiweIdentityProvider/SiweIdentityProvider";
import {checkAndGetEnvironmentVariable} from "../utils/utils";
import {ICP, paths} from "../constants";
import {
    ICPIdentityDriver,
    ICPOrganizationDriver, ICPStorageDriver
} from "@blockchain-lib/common";
import {ICPFileDriver} from "@kbc-lib/coffee-trading-management-lib";
import {NotificationType, openNotification} from "../utils/notification";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {setLogged} from "../redux/reducers/userInfoSlice";

export const ICPDriversContext = createContext<boolean>(false);
export function ICPDriversProvider({ children }: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        setIsInitialized(false);
        if(identity) {
            console.log("Initializing drivers...")
            const driverCanisterIds = {
                organization: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ORGANIZATION),
                storage: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE),
            }
            ICPOrganizationDriver.init(identity, driverCanisterIds.organization);
            ICPStorageDriver.init(identity, driverCanisterIds.storage);
            ICPFileDriver.init();
            ICPIdentityDriver.init(identity);
            setIsInitialized(true);
            openNotification(
                "Authenticated",
                `Login succeed. Welcome ${userInfo.legalName}!`,
                NotificationType.SUCCESS
            );
            dispatch(setLogged(true));
            navigate(paths.PROFILE);
        }
    }, [identity]);

    return (
        <ICPDriversContext.Provider value={isInitialized}>
            {children}
        </ICPDriversContext.Provider>
    );

}
