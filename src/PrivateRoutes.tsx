import React from "react";
import { Outlet, Navigate } from 'react-router-dom'
import {useSelector} from "react-redux";
import {RootState} from "./redux/store";
import {paths} from "./constants";
import {_SERVICE} from "./icp/declarations/ic_siwe_provider/ic_siwe_provider.did";
import {canisterId, idlFactory} from "./icp/declarations/ic_siwe_provider";
import {SignerProvider} from "./providers/SignerProvider";
import {SiweIdentityProvider} from "./providers/SiweIdentityProvider";
import {ICPProvider} from "./providers/ICPProvider";
import {EthProvider} from "./providers/EthProvider";

const PrivateRoutes = () => {
    const {isLogged} = useSelector((state: RootState) => state.userInfo);
    return(
        isLogged
            ? <SignerProvider>
                <SiweIdentityProvider<_SERVICE>
                    canisterId={canisterId}
                    idlFactory={idlFactory}
                >
                    <ICPProvider>
                        <EthProvider>
                            <Outlet/>
                        </EthProvider>
                    </ICPProvider>
                </SiweIdentityProvider>
            </SignerProvider>
            : <Navigate to={paths.LOGIN}/>
    )
}

export default PrivateRoutes;
