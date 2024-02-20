import React from "react";
import styles from "./Search.module.scss";
import {Input} from "antd";

const { Search } = Input;

type Props = {
    placeholder: string,
    onSearchFn: (filter: any) => void
}

export default (props: Props) => {
    return (
        <Search className={styles.CustomSearch} placeholder={props.placeholder} onSearch={props.onSearchFn} enterButton />
    );
}
