import React from "react";
import {type ReactNode, useEffect, useState} from "react";
import {useSiweIdentity} from "../components/icp/SiweIdentityProvider/SiweIdentityProvider";
import {checkAndGetEnvironmentVariable} from "../utils/utils";
import {ICP} from "../constants";
import {
    ICPIdentityDriver,
    ICPOrganizationDriver, ICPStorageDriver
} from "@blockchain-lib/common";
import {ICPFileDriver} from "@kbc-lib/coffee-trading-management-lib";
import {Typography} from "antd";

export function ICPDriversProvider({ children }: { children: ReactNode }) {
    const { identity } = useSiweIdentity();
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
        }
    }, [identity]);

    if ( isInitialized ) {
        return (
            <>
                {children}
            </>
        );
    } else {
        return <Typography.Text>Loading...</Typography.Text>
    }


}
