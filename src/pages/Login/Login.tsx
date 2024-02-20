import React, {useState} from "react";
import styles from './Login.module.scss';
import {Card} from "antd";
import {WalletLogin} from "./WalletLogin";
import {MattrLogin} from "./MattrLogin";

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>("wallet_login");

    const tabList = [
        // { key: 'oauth_login', tab: "OAUTH Login"},
        { key: 'mattr_login', tab: "MATTR Login"},
        { key: 'wallet_login', tab: "Wallet Login"}
    ];

    const contentList: Record<string, React.ReactNode> = {
        // oauth_login: <Auth0Login />,
        mattr_login: <MattrLogin />,
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
