import React from 'react';
import styles from './Login.module.scss';
import { Card } from 'antd';
import VeramoLogin from './VeramoLogin';

export const Login = () => {
    return (
        <div className={styles.LoginContainer}>
            <Card style={{ width: '100%', padding: 20 }}>
                <VeramoLogin />
            </Card>
        </div>
    );
};

export default Login;
