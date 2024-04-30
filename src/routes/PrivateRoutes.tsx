import { Outlet, Navigate } from 'react-router-dom'
import {useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {
    isBlockchainViewMode,
} from "../utils/storage";
import {paths} from "../constants";

const PrivateRoutes = () => {
    const {isLogged} = useSelector((state: RootState) => state.userInfo);
    return(
        !isBlockchainViewMode() || isLogged ? <Outlet/> : <Navigate to={paths.LOGIN}/>
    )
}

export default PrivateRoutes;
