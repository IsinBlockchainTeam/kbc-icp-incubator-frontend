import { ICPIdentityDriver } from "@blockchain-lib/common";
import { ICPMetadataDriver } from "@kbc-lib/coffee-trading-management-lib";
import {createContext, ReactNode, useEffect, useState} from "react";

interface ICPContextType {
    identityDriver: ICPIdentityDriver | null;
    updateIdentityDriver: (identityDriver: ICPIdentityDriver | null) => void;
}

export const ICPContext = createContext<ICPContextType>({
    identityDriver: null,
    updateIdentityDriver: (identityDriver: ICPIdentityDriver | null) => {}
});
export const ICPContextProvider = ({ children }: {children: ReactNode}) => {
    const [identityDriver, setIdentityDriver] = useState<ICPIdentityDriver | null>(null);

    // useEffect(() => {
    //     if(identityDriver) {
    //         console.log("waiting...");
    //         (async () => {
    //             // wait 5 seconds
    //             await new Promise(resolve => setTimeout(resolve, 5000));
    //             console.log("INITIALIZING ICP METADATA DRIVER");
    //             ICPMetadataDriver.init();
    //         })();
    //     }
    // }, [identityDriver]);

    const updateIdentityDriver = (identityDriver: ICPIdentityDriver | null) => {
        setIdentityDriver(identityDriver);
    }

    return (
        <ICPContext.Provider value={{
            identityDriver,
            updateIdentityDriver,
        }}>
            {children}
        </ICPContext.Provider>
    )
}
