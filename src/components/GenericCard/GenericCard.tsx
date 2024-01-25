import React from 'react';
import styles from './GenericCard.module.scss';

type Item = {
    name: string,
    value?: string
}

type Props = {
    title: string,
    icon?: React.ReactNode,
    elements: Item[]
}

export const GenericCard = (props: Props) => {
    return (
        <div className={styles.Card}>
            {props.icon}
            <h4 className={styles.Title}>{props.title}</h4>
            {
                props.elements.map((item, index) => {
                    return <p key={index}>{item.name}: {item.value}</p>
                })
            }
        </div>
    );
};
