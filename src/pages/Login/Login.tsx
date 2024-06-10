import React, { useState } from 'react';
import styles from './Login.module.scss';
import { Card } from 'antd';
import VeramoLogin from './VeramoLogin';

export const Login = () => {
    const [activeLoginTab, setActiveLoginTab] = useState<string>('vc_login');

    const tabList = [{ key: 'vc_login', tab: 'Verifiable Credential Login' }];

    const contentList: Record<string, React.ReactNode> = {
        vc_login: <VeramoLogin />
    };

    return (
        <div className={styles.LoginContainer}>
            <Card
                style={{ width: '100%' }}
                tabList={tabList}
                activeTabKey={activeLoginTab}
                onTabChange={(key) => setActiveLoginTab(key)}>
                {contentList[activeLoginTab]}
            </Card>
        </div>
    );
};

export default Login;
