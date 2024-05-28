import React from "react";
import { Outlet, Navigate } from 'react-router-dom'
import {useSelector} from "react-redux";
import {RootState} from "./redux/store";
import {paths} from "./constants";
import {_SERVICE} from "./icp/declarations/ic_siwe_provider/ic_siwe_provider.did";
import {canisterId, idlFactory} from "./icp/declarations/ic_siwe_provider";
import {SignerProvider} from "./providers/SignerProvider";
import {SiweIdentityProvider} from "./providers/SiweIdentityProvider";
import {ICPDriversProvider} from "./providers/ICPDriversProvider";
import {EthServicesProvider} from "./providers/EthServicesProvider";

const PrivateRoutes = () => {
    const {isLogged} = useSelector((state: RootState) => state.userInfo);
    return(
        isLogged
            ? <SignerProvider>
                <SiweIdentityProvider<_SERVICE>
                    canisterId={canisterId}
                    idlFactory={idlFactory}
                >
                    <ICPDriversProvider>
                        <EthServicesProvider>
                            <Outlet/>
                        </EthServicesProvider>
                    </ICPDriversProvider>
                </SiweIdentityProvider>
            </SignerProvider>
            : <Navigate to={paths.LOGIN}/>
    )
}

export default PrivateRoutes;
