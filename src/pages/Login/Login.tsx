import React, {useState} from "react";
import styles from './Login.module.scss';
import {Card} from "antd";
import {WalletLogin} from "./WalletLogin";
import VeramoLogin from "./VeramoLogin";

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>("vc_login");

    const tabList = [
        { key: 'vc_login', tab: "VC Login"},
        { key: 'wallet_login', tab: "Wallet Login"}
    ];

    const contentList: Record<string, React.ReactNode> = {
        // oauth_login: <Auth0Login />,
        vc_login: <VeramoLogin />,
        wallet_login: <WalletLogin />
    }

    return (
        <div className={styles.LoginContainer}>
            <Card
                style={{ width: '100%' }}
                tabList={tabList}
                activeTabKey={activeLoginTab}
                onTabChange={(key) => setActiveLoginTab(key)}
            >
                {contentList[activeLoginTab]}
            </Card>
        </div>
    )
}

export default Login;
