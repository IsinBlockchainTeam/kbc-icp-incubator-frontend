import React, {useState} from "react";
import styles from './Login.module.scss';
import {Card} from "antd";
import VeramoLogin from "./VeramoLogin";
import {ICPLogin} from "./ICPLogin";

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>("vc_login");

    const tabList = [
        { key: 'vc_login', tab: "Verifiable Credential Login"},
        { key: 'icp_login', tab: "Internet Computer Login"},
    ];

    const contentList: Record<string, React.ReactNode> = {
        vc_login: <VeramoLogin />,
        icp_login: <ICPLogin />,
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
