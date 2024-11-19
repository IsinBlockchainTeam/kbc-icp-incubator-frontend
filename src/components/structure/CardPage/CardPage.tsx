import styles from './CardPage.module.scss';
import { Card } from 'antd';
import * as React from 'react';

type Props = {
    children?: any;
    title: React.ReactNode;
    extra?: React.ReactNode;
};

export const CardPage = (props: Props) => {
    return (
        <Card className={styles.Card} title={props.title} extra={props.extra}>
            {props.children}
        </Card>
    );
};
