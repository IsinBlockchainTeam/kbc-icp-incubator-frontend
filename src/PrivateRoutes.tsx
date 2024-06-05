import React from "react";
import { Outlet, Navigate } from 'react-router-dom'
import {useSelector} from "react-redux";
import {RootState} from "./redux/store";
import {paths} from "./constants";
import {SignerProvider} from "./providers/SignerProvider";
import {SiweIdentityProvider} from "./providers/SiweIdentityProvider";
import {ICPProvider} from "./providers/ICPProvider";
import {EthProvider} from "./providers/EthProvider";

const PrivateRoutes = () => {
    const {isLogged} = useSelector((state: RootState) => state.userInfo);
    return(
        isLogged
            ? <SignerProvider>
                <SiweIdentityProvider>
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
